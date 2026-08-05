"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { obtenerHorariosDisponibles, obtenerDiasDisponibles } from "@/actions/turno.actions";
import { useSlotLocks } from "@/hooks/useSlotLocks";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";

interface Props {
  servicioId?: string;
  barberoId?: string;
  turnoIdAExcluir?: string;
  defaultValue?: string;
  name: string;
  sessionId?: string;
  userId?: string;
}

// Encabezados de columna: Dom primero, igual que en la imagen de referencia
const DIAS_SEMANA = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

export default function SeleccionadorHorario({
  servicioId,
  barberoId,
  turnoIdAExcluir,
  defaultValue,
  name,
  sessionId = "no-session",
  userId = "no-user",
}: Props) {
  const [fecha, setFecha] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined
  );
  // Mes actualmente visible en el calendario
  const [mesVisible, setMesVisible] = useState<Date>(
    defaultValue ? new Date(defaultValue) : new Date()
  );
  // Días del mes con al menos un horario disponible
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>([]);
  const [cargandoDias, setCargandoDias] = useState(false);

  const [slots, setSlots] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  // Horario seleccionado actualmente
  const [slotSeleccionado, setSlotSeleccionado] = useState<string>(
    defaultValue ?? ""
  );

  // Ref para evitar resetear el slot en la carga inicial
  const esPrimeraCarga = useRef(true);

  // ── WebSocket + polling para locks en tiempo real ─────────────────────
  const { isSlotBloqueado, lockSlot, unlockSlot, wsEstado } = useSlotLocks({
    barberoId: barberoId ?? "",
    fecha,
    sessionId,
    userId,
  });

  // ─── Cargar días disponibles cuando cambia el mes o los filtros ───────────
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
      if (resultado.success && Array.isArray(resultado.data)) {
        setDiasDisponibles(resultado.data);
      } else {
        setDiasDisponibles([]);
      }
    } catch (error) {
      console.error("Error cargando días disponibles:", error);
      setDiasDisponibles([]);
    } finally {
      setCargandoDias(false);
    }
  }, [mesVisible, servicioId, barberoId, turnoIdAExcluir]);

  useEffect(() => {
    cargarDiasDelMes();
  }, [cargarDiasDelMes]);

  // ─── Cargar horarios al seleccionar una fecha concreta ───────────────────
  useEffect(() => {
    async function cargarHorarios() {
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
        if (resultado.success && Array.isArray(resultado.data)) {
          setSlots(resultado.data);
        } else {
          setSlots([]);
        }
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setSlots([]);
      } finally {
        setCargando(false);
        // Marcar que la primera carga ya ocurrió
        esPrimeraCarga.current = false;
      }
    }
    cargarHorarios();
  }, [fecha, servicioId, barberoId, turnoIdAExcluir]);

  // ─── Navegar entre meses ──────────────────────────────────────────────────
  const irAlMesAnterior = () => setMesVisible((m) => subMonths(m, 1));
  const irAlMesSiguiente = () => setMesVisible((m) => addMonths(m, 1));

  // ─── Seleccionar un día del calendario ───────────────────────────────────
  const manejarSeleccionFecha = (dia: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (dia < hoy) return;
    setFecha(dia);
    // Liberar slot anterior al cambiar de fecha
    if (!esPrimeraCarga.current) {
      unlockSlot();
      setSlotSeleccionado("");
    }
  };

  // ─── Seleccionar un slot de hora ─────────────────────────────────────────
  const manejarSeleccionSlot = (slot: string) => {
    if (isSlotBloqueado(slot)) return;
    setSlotSeleccionado(slot);
    lockSlot(slot);
  };

  // ─── Construir grilla (semana empieza en Domingo, weekStartsOn: 0) ────────
  const construirGrillaDelMes = (): Date[] => {
    const inicioDeMes = startOfMonth(mesVisible);
    const finDeMes = endOfMonth(mesVisible);
    const inicioGrilla = startOfWeek(inicioDeMes, { weekStartsOn: 0 });
    const finGrilla = endOfWeek(finDeMes, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: inicioGrilla, end: finGrilla });
  };

  // ─── Helpers de estado por día ────────────────────────────────────────────
  const esDiaDisponible = (dia: Date): boolean =>
    diasDisponibles.includes(format(dia, "yyyy-MM-dd"));

  const esDiaSeleccionado = (dia: Date): boolean =>
    fecha ? isSameDay(dia, fecha) : false;

  const esDiaPasado = (dia: Date): boolean => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return dia < hoy;
  };

  // ─── Formatea un slot ISO a "HH:MM hs" ───────────────────────────────────
  const formatearHora = (slot: string) =>
    new Date(slot).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " hs";

  const diasEnGrilla = construirGrillaDelMes();

  // Título del mes capitalizado: "Mayo 2026"
  const tituloMes = format(mesVisible, "MMMM yyyy", { locale: es }).replace(
    /^\w/,
    (c) => c.toUpperCase()
  );

  return (
    <div className="space-y-4">
      {/* Campo oculto para enviar el slot seleccionado en el formulario */}
      <input type="hidden" name={name} value={slotSeleccionado} />

      {/* SELECTOR DE FECHA */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-widest ml-1">
          Fecha de Reserva <span className="text-[#E8B031]">*</span>
        </label>

        {/*
          Contenedor con ancho máximo fijo para que las 7 columnas
          queden compactas y no se estiren al ancho completo del formulario.
        */}
        <div className="bg-[#18150F] border border-[#2A2318] rounded-2xl overflow-hidden w-full max-w-[340px]">

          {/* Encabezado: nombre del mes + flechas de navegación */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              {tituloMes}
              {/* Spinner mientras se cargan los días disponibles */}
              {cargandoDias && (
                <span className="w-3 h-3 border border-[#E8B031]/40 border-t-[#E8B031] rounded-full animate-spin inline-block" />
              )}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={irAlMesAnterior}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8E8675] hover:text-white hover:bg-white/5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={irAlMesSiguiente}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8E8675] hover:text-white hover:bg-white/5 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cabecera de días de la semana */}
          <div className="grid grid-cols-7 px-2">
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia}
                className="text-center text-[9px] font-bold text-[#6B6355] uppercase tracking-wider py-1.5"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grilla de días — celdas de tamaño fijo pequeño */}
          <div className="grid grid-cols-7 px-2 pb-3">
            {diasEnGrilla.map((dia, idx) => {
              const estesMes = isSameMonth(dia, mesVisible);
              const seleccionado = esDiaSeleccionado(dia);
              const disponible = estesMes && esDiaDisponible(dia);
              const pasado = esDiaPasado(dia);
              const hoy = isToday(dia);

              return (
                <div key={idx} className="flex items-center justify-center py-[3px]">
                  <button
                    type="button"
                    onClick={() =>
                      disponible && !pasado && manejarSeleccionFecha(dia)
                    }
                    disabled={!disponible || pasado || !estesMes}
                    className={`
                      relative flex items-center justify-center
                      w-8 h-8 rounded-lg text-[11px] font-semibold
                      transition-all duration-150 select-none
                      ${
                        !estesMes
                          ? // Días fuera del mes: invisibles
                            "opacity-0 pointer-events-none"
                          : seleccionado
                          ? // Seleccionado: cuadrado naranja fuerte
                            "bg-[#E8B031] text-[#14110C] font-black shadow-[0_0_10px_rgba(232,176,49,0.4)]"
                          : disponible && !pasado
                          ? // Disponible: texto naranja, hover suave
                            "text-[#E8B031] font-semibold hover:bg-[#E8B031]/15 cursor-pointer"
                          : pasado
                          ? // Pasado: muy atenuado
                            "text-[#3A342C] cursor-not-allowed"
                          : // Sin disponibilidad
                            "text-[#4A4438] cursor-not-allowed"
                      }
                    `}
                  >
                    {format(dia, "d")}

                    {/* Puntito naranja debajo del número en días disponibles no seleccionados */}
                    {disponible && !seleccionado && !pasado && estesMes && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[#E8B031]/70" />
                    )}

                    {/* Anillo para el día de hoy (si no está seleccionado) */}
                    {hoy && !seleccionado && estesMes && (
                      <span className="absolute inset-0 rounded-lg ring-1 ring-[#E8B031]/30 pointer-events-none" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Leyenda compacta */}
          <div className="flex items-center gap-3 px-4 pb-3 pt-1 border-t border-[#2A2318]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-[#E8B031]" />
              <span className="text-[9px] text-[#6B6355]">Seleccionado</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#E8B031] font-bold">7</span>
              <span className="text-[9px] text-[#6B6355]">Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#4A4438] font-bold">7</span>
              <span className="text-[9px] text-[#6B6355]">Sin turnos</span>
            </div>
          </div>
        </div>

        {/* Fecha seleccionada como texto descriptivo */}
        {fecha && (
          <p className="text-[11px] text-[#E8B031] ml-1 font-medium tracking-wide">
            📅{" "}
            {format(fecha, "EEEE d 'de' MMMM", { locale: es }).replace(
              /^\w/,
              (c) => c.toUpperCase()
            )}
          </p>
        )}
      </div>

      {/* CUADRÍCULA DE HORARIOS */}
      <div className="space-y-2">
        {/* Header con indicador de estado WS */}
        <div className="flex items-center justify-between ml-1">
          <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-widest">
            Horarios Disponibles <span className="text-[#E8B031]">*</span>
          </label>
          {/* Indicador de conexión WebSocket */}
          {barberoId && fecha && (
            <div className="flex items-center gap-1.5 mr-1">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  wsEstado === "conectado"
                    ? "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.7)]"
                    : wsEstado === "conectando"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500/60"
                }`}
              />
              <span className="text-[8px] text-[#6B6355] uppercase tracking-widest">
                {wsEstado === "conectado"
                  ? "En vivo"
                  : wsEstado === "conectando"
                  ? "Conectando"
                  : "Sin conexión"}
              </span>
            </div>
          )}
        </div>

        {!fecha || !servicioId || !barberoId ? (
          /* Estado: faltan datos */
          <div className="p-5 bg-black/60 border border-[#2C261D] rounded-xl border-dashed">
            <p className="text-[11px] text-[#8E8675] flex items-center gap-2">
              <span className="text-amber-500">ℹ️</span> Seleccione servicio,
              barbero y fecha para ver disponibilidad
            </p>
          </div>
        ) : cargando ? (
          /* Estado: cargando horarios */
          <div className="p-5 bg-black/20 border border-[#2C261D] rounded-xl flex items-center gap-3 animate-pulse">
            <div className="w-4 h-4 border-2 border-[#E8B031]/30 border-t-[#E8B031] rounded-full animate-spin" />
            <p className="text-[11px] text-[#8E8675]">Consultando agenda...</p>
          </div>
        ) : slots.length === 0 ? (
          /* Estado: sin disponibilidad */
          <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-[11px] text-red-400/80 flex items-center gap-2">
              <span className="text-red-500 font-bold">😔</span> No hay
              horarios disponibles para esta combinación
            </p>
          </div>
        ) : (
          /* Estado: grilla de horarios disponibles */
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const estaSeleccionado = slotSeleccionado === slot;
                const estaBloqueado = isSlotBloqueado(slot);

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => manejarSeleccionSlot(slot)}
                    disabled={estaBloqueado}
                    title={estaBloqueado ? "Seleccionado por otro usuario" : undefined}
                    className={`
                      relative px-2 py-3 rounded-xl text-xs font-bold tracking-wide
                      border transition-all duration-200
                      ${
                        estaBloqueado
                          ? // Bloqueado por otro usuario: gris con candado
                            "bg-[#1A1612] border-[#2A2318] text-[#4A4438] cursor-not-allowed opacity-70"
                          : estaSeleccionado
                          ? // Activo: dorado
                            "bg-[#E8B031] border-[#E8B031] text-[#14110C] shadow-[0_0_12px_rgba(232,176,49,0.35)] cursor-pointer"
                          : // Inactivo: oscuro con borde sutil
                            "bg-[#1C1812] border-[#2C261D] text-[#E4E0D9] hover:border-[#E8B031]/50 hover:text-[#E8B031] cursor-pointer"
                      }
                    `}
                  >
                    {estaBloqueado ? (
                      /* Slot bloqueado por otro usuario */
                      <span className="flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        {formatearHora(slot)}
                      </span>
                    ) : (
                      formatearHora(slot)
                    )}

                    {/* Indicador visual de selección activa */}
                    {estaSeleccionado && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E8B031] rounded-full border-2 border-[#14110C] flex items-center justify-center">
                        <svg viewBox="0 0 8 8" className="w-2 h-2 fill-[#14110C]">
                          <path
                            d="M1 4l2 2 4-4"
                            stroke="#14110C"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contador de slots encontrados */}
            <div className="flex items-center gap-2 ml-1">
              <div className="w-1 h-1 rounded-full bg-green-500" />
              <p className="text-[10px] font-bold text-green-500/70 uppercase tracking-widest">
                {slots.length} turnos encontrados
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}