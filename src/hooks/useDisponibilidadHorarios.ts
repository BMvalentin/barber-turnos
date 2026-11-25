"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addMonths, subMonths, format, parseISO } from "date-fns";
import { useSlotLocks } from "@/hooks/useSlotLocks";
import { MINIMO_ANTICIPACION_MS } from "@/lib/constants";
import { filtrarHorariosPorDuracion, type CapacidadHoraria } from "@/lib/turnos/capacidad-horaria";
import {
  claveDisponibilidad,
  consultarDisponibilidadMensual,
  invalidarDisponibilidadLocal,
  leerDisponibilidadEnMemoria,
  precargarDisponibilidadMensual,
} from "@/lib/turnos/disponibilidad-cliente";
import { filtrarSlotsVigentes } from "@/lib/turnos/filtrar-slots-vigentes";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { HorarioNoDisponible } from "@/types/turno";

interface OpcionesDisponibilidadHorarios {
  duracion?: number;
  barberoId?: string;
  barberos: readonly string[];
  turnoInicial?: { id: string; barberoId: string; horarioReservado: Date } | null;
  usuarioId?: string;
  defaultValue?: string;
  sessionId?: string;
  userId?: string;
  activo?: boolean;
}

/**
 * Hook del seleccionador de horarios: estado de la fecha, los días del mes,
 * los slots horarios y la selección con locks en tiempo real.
 */
export function useDisponibilidadHorarios({ duracion, barberoId, barberos, turnoInicial, usuarioId, defaultValue, sessionId = "no-session", userId = "no-user", activo = true }: OpcionesDisponibilidadHorarios) {
  const [fecha, setFecha] = useState<Date | undefined>(() => defaultValue ? parseISO(obtenerFechaSola(defaultValue)) : undefined);
  const [mesVisible, setMesVisible] = useState(() => parseISO(obtenerFechaSola(defaultValue ?? new Date())));
  const [estadoMes, setEstadoMes] = useState<{
    clave: string;
    capacidad?: CapacidadHoraria;
  } | null>(null);
  const [revision, setRevision] = useState(0);
  const [slotSeleccionado, setSlotSeleccionado] = useState<string>(defaultValue ?? "");
  const mesVisibleStr = format(mesVisible, "yyyy-MM");
  const turnoId = turnoInicial?.id;
  const barberoInicialId = turnoInicial?.barberoId;
  const mesInicial = turnoInicial && obtenerFechaSola(turnoInicial.horarioReservado).slice(0, 7);
  const obtenerExclusion = useCallback((mes: string, id: string) =>
    turnoId && usuarioId && mes === mesInicial && id === barberoInicialId ? { turnoId, usuarioId } : undefined,
  [barberoInicialId, mesInicial, turnoId, usuarioId]);
  const claveMes = barberoId ? claveDisponibilidad(mesVisibleStr, barberoId, obtenerExclusion(mesVisibleStr, barberoId)) : "";
  const capacidadMes = leerDisponibilidadEnMemoria(claveMes)?.capacidad ?? (estadoMes?.clave === claveMes ? estadoMes.capacidad : undefined);
  const errorConsulta = estadoMes?.clave === claveMes && !capacidadMes;
  const hayServicio = Boolean(duracion && duracion > 0);
  const cargandoDias = activo && hayServicio && Boolean(barberoId) && !capacidadMes && !errorConsulta;
  const horarios = useMemo(
    () => activo && duracion && duracion > 0 && capacidadMes
      ? filtrarHorariosPorDuracion(capacidadMes, duracion)
      : {},
    [activo, duracion, capacidadMes],
  );
  const ahora = Date.now();
  const diasDisponibles = Object.entries(horarios).flatMap(([dia, inicios]) => {
    const ultimo = inicios[inicios.length - 1];
    return ultimo && Date.parse(ultimo) > ahora + MINIMO_ANTICIPACION_MS ? [dia] : [];
  });
  const fechaStr = fecha ? format(fecha, "yyyy-MM-dd") : null;
  const fechaDelMesVisible = fechaStr?.slice(0, 7) === mesVisibleStr;
  const cargando = Boolean(fechaDelMesVisible && cargandoDias);
  const slots = activo && fechaDelMesVisible && fechaStr
    ? filtrarSlotsVigentes(horarios[fechaStr] ?? [], ahora)
    : [];

  const barberoAnteriorRef = useRef(barberoId);

  // Se consultan los bloqueos cuando el día seleccionado está a la vista.
  const { isSlotBloqueado, lockSlot, unlockSlot, refrescarLocks } = useSlotLocks({
    barberoId: barberoId ?? "",
    fecha,
    sessionId,
    userId,
    activo,
    consultarDia: fechaDelMesVisible && hayServicio,
  });

  // Ref para usar siempre la última referencia de unlockSlot
  const unlockSlotRef = useRef(unlockSlot);
  useEffect(() => {
    unlockSlotRef.current = unlockSlot;
  }, [unlockSlot]);

  // Cambiar de barbero cambia la agenda. Al montar se conserva el turno en edición.
  useEffect(() => {
    if (barberoId === barberoAnteriorRef.current) return;
    barberoAnteriorRef.current = barberoId;
    unlockSlotRef.current();
    setFecha(undefined);
    setSlotSeleccionado("");
  }, [barberoId]);

  useEffect(() => {
    if (!activo) return;
    const barberosSinExclusion = barberos.filter((id) => !obtenerExclusion(mesVisibleStr, id));
    void precargarDisponibilidadMensual(mesVisibleStr, barberosSinExclusion);
    void precargarDisponibilidadMensual(format(addMonths(parseISO(`${mesVisibleStr}-01`), 1), "yyyy-MM"), barberos);
  }, [activo, barberos, mesVisibleStr, obtenerExclusion]);

  useEffect(() => {
    if (!activo || !barberoId) return;
    let vigente = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const exclusion = obtenerExclusion(mesVisibleStr, barberoId);
    const consultar = async () => {
      const entrada = await consultarDisponibilidadMensual(mesVisibleStr, barberoId, exclusion);
      if (!vigente) return;
      setEstadoMes({ clave: claveMes, capacidad: entrada?.capacidad });
      if (entrada) temporizador = setTimeout(consultar, Math.max(0, entrada.venceEn - Date.now()));
    };
    void consultar();
    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [activo, barberoId, claveMes, mesVisibleStr, obtenerExclusion, revision]);

  const reintentarConsulta = () => {
    if (!barberoId) return;
    void consultarDisponibilidadMensual(mesVisibleStr, barberoId, obtenerExclusion(mesVisibleStr, barberoId), true);
    setEstadoMes(null);
    setRevision((actual) => actual + 1);
  };

  const actualizarTrasConflicto = useCallback(({ barberoId: id, horario }: HorarioNoDisponible) => {
    const dia = obtenerFechaSola(horario);
    const mes = dia.slice(0, 7);
    const exclusion = obtenerExclusion(mes, id);
    invalidarDisponibilidadLocal(id, dia);
    void consultarDisponibilidadMensual(mes, id, exclusion, true);
    if (id !== barberoId) return;
    if (slotSeleccionado === horario) {
      unlockSlot();
      setSlotSeleccionado("");
    }
    if (fechaStr === dia) void refrescarLocks();
    if (mes === mesVisibleStr) {
      setEstadoMes(null);
      setRevision((actual) => actual + 1);
    }
  }, [barberoId, fechaStr, mesVisibleStr, obtenerExclusion, refrescarLocks, slotSeleccionado, unlockSlot]);

  const validarHorarioParaServicio = (duracionNueva?: number) => {
    if (!fechaStr || !slotSeleccionado || !barberoId) return;
    const mes = fechaStr.slice(0, 7);
    const claveFecha = claveDisponibilidad(mes, barberoId, obtenerExclusion(mes, barberoId));
    const capacidad = leerDisponibilidadEnMemoria(claveFecha)?.capacidad[fechaStr] ?? [];
    const horariosCompatibles = duracionNueva
      ? filtrarHorariosPorDuracion({ [fechaStr]: capacidad }, duracionNueva)[fechaStr] ?? []
      : [];
    if (horariosCompatibles.includes(slotSeleccionado)) return;

    unlockSlot();
    setSlotSeleccionado("");
  };

  const irAlMesAnterior = useCallback(() => setMesVisible((m) => subMonths(m, 1)), []);
  const irAlMesSiguiente = useCallback(() => setMesVisible((m) => addMonths(m, 1)), []);

  const manejarSeleccionFecha = useCallback(
    (dia: Date) => {
      const hoy = parseISO(obtenerFechaSola(new Date()));
      if (dia < hoy) return;
      if (fecha && format(fecha, "yyyy-MM-dd") === format(dia, "yyyy-MM-dd")) return;
      setFecha(dia);
      // Liberar slot anterior al cambiar de fecha
      unlockSlot();
      setSlotSeleccionado("");
    },
    [fecha, unlockSlot]
  );

  const manejarSeleccionSlot = useCallback(
    (slot: string) => {
      if (isSlotBloqueado(slot)) return;
      setSlotSeleccionado(slot);
      lockSlot(slot);
    },
    [isSlotBloqueado, lockSlot]
  );

  return {
    fecha,
    mesVisible,
    diasDisponibles,
    cargandoDias,
    slots,
    cargando,
    slotSeleccionado,
    isSlotBloqueado,
    irAlMesAnterior,
    irAlMesSiguiente,
    manejarSeleccionFecha,
    manejarSeleccionSlot,
    validarHorarioParaServicio,
    errorConsulta: hayServicio && errorConsulta,
    reintentarConsulta,
    actualizarTrasConflicto,
  };
}
