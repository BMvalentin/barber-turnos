"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DiaCalendario from "./DiaCalendario";

// Encabezados de columna: Dom primero, igual que en la imagen de referencia
const DIAS_SEMANA = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

interface PropsGrillaCalendario {
  mesVisible: Date;
  diasDisponibles: string[];
  fecha: Date | undefined;
  cargandoDias: boolean;
  onMesAnterior: () => void;
  onMesSiguiente: () => void;
  onSeleccionarDia: (dia: Date) => void;
}

/**
 * Selector de fecha: calendario del mes con días disponibles y navegación.
 */
export default function GrillaCalendario({
  mesVisible,
  diasDisponibles,
  fecha,
  cargandoDias,
  onMesAnterior,
  onMesSiguiente,
  onSeleccionarDia,
}: PropsGrillaCalendario) {
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

  const diasEnGrilla = construirGrillaDelMes();

  // Título del mes capitalizado: "Mayo 2026"
  const tituloMes = format(mesVisible, "MMMM yyyy", { locale: es }).replace(
    /^\w/,
    (c) => c.toUpperCase()
  );

  return (
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
              onClick={onMesAnterior}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8E8675] hover:text-white hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onMesSiguiente}
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
                <DiaCalendario
                  dia={dia}
                  estesMes={estesMes}
                  seleccionado={seleccionado}
                  disponible={disponible}
                  pasado={pasado}
                  hoy={hoy}
                  onSeleccionar={onSeleccionarDia}
                />
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
  );
}