"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { obtenerDiasDisponibles } from "@/actions/turnos/disponibilidad.actions";
import { useSlotLocks } from "@/hooks/useSlotLocks";
import { filtrarSlotsVigentes } from "@/lib/turnos/filtrar-slots-vigentes";

interface OpcionesDisponibilidadHorarios {
  servicioId?: string;
  barberoId?: string;
  turnoIdAExcluir?: string;
  defaultValue?: string;
  sessionId?: string;
  userId?: string;
  activo?: boolean;
}

/**
 * Hook del seleccionador de horarios: estado de la fecha, los días del mes,
 * los slots horarios y la selección con locks en tiempo real.
 */
export function useDisponibilidadHorarios({ servicioId, barberoId, turnoIdAExcluir, defaultValue, sessionId = "no-session", userId = "no-user", activo = true }: OpcionesDisponibilidadHorarios) {
  const [fecha, setFecha] = useState<Date | undefined>(defaultValue ? new Date(defaultValue) : undefined);
  const [mesVisible, setMesVisible] = useState<Date>(defaultValue ? new Date(defaultValue) : new Date());
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>([]);
  const [cargandoDias, setCargandoDias] = useState(false);
  const [estadoMes, setEstadoMes] = useState<{
    clave: string;
    horarios: Record<string, string[]> | null;
  } | null>(null);
  const [slotSeleccionado, setSlotSeleccionado] = useState<string>(defaultValue ?? "");
  const solicitudDiasRef = useRef(0);
  const mesVisibleStr = format(mesVisible, "yyyy-MM");
  const claveMes = JSON.stringify([mesVisibleStr, servicioId, barberoId, turnoIdAExcluir]);
  const fechaStr = fecha ? format(fecha, "yyyy-MM-dd") : null;
  const fechaDelMesVisible = fechaStr?.slice(0, 7) === mesVisibleStr;
  const consultaHorarioActiva = activo && Boolean(fechaStr && servicioId && barberoId && fechaDelMesVisible);
  const cargando = consultaHorarioActiva && estadoMes?.clave !== claveMes;
  const slots = consultaHorarioActiva && !cargando && fechaStr
    ? filtrarSlotsVigentes(estadoMes?.horarios?.[fechaStr] ?? [])
    : [];

  // Comparar con los valores anteriores evita limpiar el turno precargado al
  // montar y también contempla volver a la selección inicial.
  const valoresAnterioresRef = useRef({ servicioId, barberoId });

  // Locks en tiempo real (polling REST)
  const { isSlotBloqueado, lockSlot, unlockSlot } = useSlotLocks({
    barberoId: barberoId ?? "",
    fecha,
    sessionId,
    userId,
    activo,
  });

  // Ref para usar siempre la última referencia de unlockSlot
  const unlockSlotRef = useRef(unlockSlot);
  useEffect(() => {
    unlockSlotRef.current = unlockSlot;
  }, [unlockSlot]);

  // Al cambiar barbero/servicio la fecha y el horario dejan de ser válidos:
  // se libera el lock y se limpian las selecciones. En el montaje inicial no se
  // limpia nada para no romper el modo edición (que inicializa defaultValue).
  useEffect(() => {
    if (
      servicioId === valoresAnterioresRef.current.servicioId &&
      barberoId === valoresAnterioresRef.current.barberoId
    ) {
      return;
    }
    valoresAnterioresRef.current = { servicioId, barberoId };
    unlockSlotRef.current();
    setFecha(undefined);
    setSlotSeleccionado("");
  }, [servicioId, barberoId]);

  const cargarDiasDelMes = useCallback(async () => {
    const idSolicitud = ++solicitudDiasRef.current;
    if (!servicioId || !barberoId) {
      setDiasDisponibles([]);
      setCargandoDias(false);
      setEstadoMes(null);
      return;
    }
    try {
      setCargandoDias(true);
      const resultado = await obtenerDiasDisponibles(
        mesVisibleStr,
        servicioId,
        barberoId,
        turnoIdAExcluir
      );
      if (idSolicitud === solicitudDiasRef.current) {
        const datos = resultado.success ? resultado.data : undefined;
        setDiasDisponibles(datos?.dias ?? []);
        setEstadoMes({ clave: claveMes, horarios: datos?.horarios ?? null });
      }
    } catch (error) {
      console.error("Error cargando días disponibles:", error);
      if (idSolicitud === solicitudDiasRef.current) {
        setDiasDisponibles([]);
        setEstadoMes({ clave: claveMes, horarios: null });
      }
    } finally {
      if (idSolicitud === solicitudDiasRef.current) {
        setCargandoDias(false);
      }
    }
  }, [mesVisibleStr, servicioId, barberoId, turnoIdAExcluir, claveMes]);

  useEffect(() => {
    if (!activo) {
      solicitudDiasRef.current += 1;
      setCargandoDias(false);
      setEstadoMes(null);
      return;
    }
    cargarDiasDelMes();
  }, [cargarDiasDelMes, activo]);

  const irAlMesAnterior = useCallback(() => setMesVisible((m) => subMonths(m, 1)), []);
  const irAlMesSiguiente = useCallback(() => setMesVisible((m) => addMonths(m, 1)), []);

  const manejarSeleccionFecha = useCallback(
    (dia: Date) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
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
  };
}
