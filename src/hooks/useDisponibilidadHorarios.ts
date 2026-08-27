"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { obtenerDiasDisponibles } from "@/actions/turnos/disponibilidad.actions";
import { obtenerHorariosDisponibles } from "@/actions/turnos/horarios-disponibles.actions";
import { useSlotLocks } from "@/hooks/useSlotLocks";

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
  const [slots, setSlots] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [slotSeleccionado, setSlotSeleccionado] = useState<string>(defaultValue ?? "");

  // Ref para evitar resetear el slot en la carga inicial
  const esPrimeraCarga = useRef(true);

  // Valores iniciales de barbero/servicio: el slot solo se limpia cuando estos
  // CAMBIAN respecto de la inicialización (no en el montaje). Comparar valores
  // en vez de un ref booleano es robusto a la doble invocación de efectos que
  // hace React StrictMode en desarrollo (setup -> cleanup -> setup).
  const valoresInicialesRef = useRef({ servicioId, barberoId });

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

  // Al cambiar barbero/servicio el horario seleccionado deja de ser válido:
  // se libera el lock y se limpia la selección. En el montaje inicial no se
  // limpia nada para no romper el modo edición (que inicializa defaultValue).
  useEffect(() => {
    if (
      servicioId === valoresInicialesRef.current.servicioId &&
      barberoId === valoresInicialesRef.current.barberoId
    ) {
      return;
    }
    unlockSlotRef.current();
    setSlotSeleccionado("");
  }, [servicioId, barberoId]);

  const cargarDiasDelMes = useCallback(async () => {
    if (!servicioId || !barberoId) {
      setDiasDisponibles([]);
      return;
    }
    try {
      setCargandoDias(true);
      const mesStr = format(mesVisible, "yyyy-MM");
      const resultado = await obtenerDiasDisponibles(
        mesStr,
        servicioId,
        barberoId,
        turnoIdAExcluir
      );
      setDiasDisponibles(
        resultado.success && Array.isArray(resultado.data)
          ? resultado.data
          : []
      );
    } catch (error) {
      console.error("Error cargando días disponibles:", error);
      setDiasDisponibles([]);
    } finally {
      setCargandoDias(false);
    }
  }, [mesVisible, servicioId, barberoId, turnoIdAExcluir]);

  useEffect(() => {
    if (!activo) return;
    cargarDiasDelMes();
  }, [cargarDiasDelMes, activo]);

  useEffect(() => {
    if (!activo) return;
    (async () => {
      if (!fecha || !servicioId || !barberoId) {
        setSlots([]);
        return;
      }
      const fechaStr = format(fecha, "yyyy-MM-dd");
      try {
        setCargando(true);
        const resultado = await obtenerHorariosDisponibles(
          fechaStr,
          servicioId,
          barberoId,
          turnoIdAExcluir
        );
        setSlots(
          resultado.success && Array.isArray(resultado.data)
            ? resultado.data
            : []
        );
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setSlots([]);
      } finally {
        setCargando(false);
        // Marcar que la primera carga ya ocurrió
        esPrimeraCarga.current = false;
      }
    })();
  }, [fecha, servicioId, barberoId, turnoIdAExcluir, activo]);

  const irAlMesAnterior = useCallback(() => setMesVisible((m) => subMonths(m, 1)), []);
  const irAlMesSiguiente = useCallback(() => setMesVisible((m) => addMonths(m, 1)), []);

  const manejarSeleccionFecha = useCallback(
    (dia: Date) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (dia < hoy) return;
      setFecha(dia);
      // Liberar slot anterior al cambiar de fecha
      if (!esPrimeraCarga.current) {
        unlockSlot();
        setSlotSeleccionado("");
      }
    },
    [unlockSlot]
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