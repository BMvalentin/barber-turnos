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
const CLASE_NAVEGACION = "rounded-lg p-1.5 text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] in-[.reserva-publica]:grid in-[.reserva-publica]:size-11 in-[.reserva-publica]:place-items-center";

export default function CalendarioReserva({
  mesVisible,
  diasDisponibles,
  cargandoDias,
  fecha,
  onMesAnterior,
  onMesSiguiente,
  onSeleccionarDia,
  permitirFechasPasadas = false,
}: PropsCalendarioReserva) {
  const grillaDelMes = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesVisible), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(mesVisible), { weekStartsOn: 0 }),
  });

  const inicioDeHoy = new Date();
  inicioDeHoy.setHours(0, 0, 0, 0);

  const tituloMes = format(mesVisible, "MMMM yyyy", { locale: es }).replace(
    /^\w/,
    (letra) => letra.toUpperCase(),
  );

  return (
    <div className="space-y-2 rounded-xl bg-[var(--admin-surface-elevated)] p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize text-[var(--admin-texto-primario)]" aria-live="polite">
          {tituloMes}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMesAnterior}
            aria-label="Mes anterior"
            className={CLASE_NAVEGACION}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMesSiguiente}
            aria-label="Mes siguiente"
            className={CLASE_NAVEGACION}
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
        <div className="grid grid-cols-7 gap-1" role="status" aria-busy="true" aria-label="Cargando días disponibles">
          {grillaDelMes.map((dia) => (
            <div
              key={format(dia, "yyyy-MM-dd")}
              className="h-10 rounded-lg bg-[var(--admin-border)] motion-safe:animate-pulse in-[.reserva-publica]:h-11"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {grillaDelMes.map((dia) => {
            const claveDia = format(dia, "yyyy-MM-dd");
            const estaEnElMes = isSameMonth(dia, mesVisible);
            const pasado = !permitirFechasPasadas && dia < inicioDeHoy;
            const disponible =
              estaEnElMes &&
              !pasado &&
              diasDisponibles.includes(claveDia);
            const seleccionado = fecha ? isSameDay(dia, fecha) : false;
            const esHoy = isToday(dia);

            return (
              <DiaCalendarioReserva
                key={claveDia}
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
