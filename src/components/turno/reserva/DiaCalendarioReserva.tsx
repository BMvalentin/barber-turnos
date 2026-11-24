"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PropsDiaCalendarioReserva } from "@/components/turno/reserva/tipos";

export default function DiaCalendarioReserva({
  dia,
  estaEnElMes,
  disponible,
  seleccionado,
  esHoy,
  pasado,
  onSeleccionar,
}: PropsDiaCalendarioReserva) {
  const clases =
    seleccionado
      ? "bg-[var(--page-primary)] text-[var(--page-primary-foreground)] font-bold shadow-[0_0_10px_color-mix(in_srgb,var(--page-primary)_40%,transparent)] ring-1 ring-[var(--admin-border-fuerte)] in-[.reserva-publica]:shadow-none"
      : !estaEnElMes || pasado
        ? "text-[var(--admin-texto-muted)] opacity-40 cursor-not-allowed in-[.reserva-publica]:opacity-100"
        : !disponible
          ? "text-[var(--admin-texto-muted)] opacity-50 cursor-not-allowed in-[.reserva-publica]:opacity-100"
          : "text-[var(--admin-texto-primario)] hover:bg-[var(--page-primary-20)] cursor-pointer in-[.reserva-publica]:font-semibold in-[.reserva-publica]:hover:bg-[var(--admin-item-hover)]";

  return (
    <button
      type="button"
      aria-hidden={!estaEnElMes || undefined}
      aria-label={format(dia, "EEEE d 'de' MMMM", { locale: es })}
      aria-current={esHoy ? "date" : undefined}
      aria-pressed={seleccionado}
      onClick={() => onSeleccionar(dia)}
      disabled={!estaEnElMes || pasado || !disponible}
      className={`h-10 w-full rounded-lg text-sm transition flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] in-[.reserva-publica]:h-11 in-[.reserva-publica]:rounded-md in-[.reserva-publica]:transition-colors ${
        esHoy && !seleccionado ? "ring-1 ring-[var(--admin-border-fuerte)] ring-inset" : ""
      } ${clases}`}
    >
      {/* Días de otro mes: el número queda invisible para mantener la grilla prolija */}
      <span className={!estaEnElMes ? "invisible" : undefined}>{format(dia, "d")}</span>
      {disponible && !seleccionado && (
        <span aria-hidden="true" className="mx-auto mt-0.5 block size-1 rounded-full bg-[var(--page-primary-70)] in-[.reserva-publica]:bg-[var(--admin-texto-primario)]" />
      )}
    </button>
  );
}
