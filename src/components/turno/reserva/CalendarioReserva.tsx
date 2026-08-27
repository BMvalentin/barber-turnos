"use client";

import {
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DiaCalendarioReserva from "@/components/turno/reserva/DiaCalendarioReserva";
import type { PropsCalendarioReserva } from "@/components/turno/reserva/tipos";

const ABREVIATURAS_DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

export default function CalendarioReserva({
  mesVisible,
  diasDisponibles,
  cargandoDias,
  fecha,
  onMesAnterior,
  onMesSiguiente,
  onSeleccionarDia,
}: PropsCalendarioReserva) {
  const construirGrillaDelMes = (): Date[] => {
    const inicioDeMes = startOfMonth(mesVisible);
    const finDeMes = endOfMonth(mesVisible);
    const inicioGrilla = startOfWeek(inicioDeMes, { weekStartsOn: 0 });
    const finGrilla = endOfWeek(finDeMes, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: inicioGrilla, end: finGrilla });
  };

  const inicioDeHoy = new Date();
  inicioDeHoy.setHours(0, 0, 0, 0);

  const tituloMes = format(mesVisible, "MMMM yyyy", { locale: es }).replace(
    /^\w/,
    (letra) => letra.toUpperCase(),
  );

  return (
    <div className="bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--admin-texto-primario)] capitalize">
          {tituloMes}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMesAnterior}
            aria-label="Mes anterior"
            className="p-1.5 rounded-lg text-[var(--admin-texto-secundario)] hover:bg-white/5 hover:text-[var(--page-primary-tinta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMesSiguiente}
            aria-label="Mes siguiente"
            className="p-1.5 rounded-lg text-[var(--admin-texto-secundario)] hover:bg-white/5 hover:text-[var(--page-primary-tinta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {ABREVIATURAS_DIAS.map((dia) => (
          <span
            key={dia}
            className="py-1 text-center text-[11px] font-semibold text-[var(--admin-texto-muted)]"
          >
            {dia}
          </span>
        ))}
      </div>

      {cargandoDias ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, indice) => (
            <div
              key={indice}
              className="h-10 animate-pulse rounded-lg bg-[var(--admin-border)]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {construirGrillaDelMes().map((dia, indice) => {
            const estaEnElMes = isSameMonth(dia, mesVisible);
            const pasado = dia < inicioDeHoy;
            const disponible =
              estaEnElMes &&
              !pasado &&
              diasDisponibles.includes(format(dia, "yyyy-MM-dd"));
            const seleccionado = fecha ? isSameDay(dia, fecha) : false;
            const esHoy = isToday(dia);

            return (
              <DiaCalendarioReserva
                key={indice}
                dia={dia}
                estaEnElMes={estaEnElMes}
                disponible={disponible}
                seleccionado={seleccionado}
                esHoy={esHoy}
                pasado={pasado}
                onSeleccionar={onSeleccionarDia}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
