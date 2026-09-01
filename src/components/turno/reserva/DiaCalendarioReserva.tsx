"use client";

import { format } from "date-fns";
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
      ? "bg-[var(--page-primary)] text-[var(--page-primary-foreground)] font-bold shadow-[0_0_10px_color-mix(in_srgb,var(--page-primary)_40%,transparent)] ring-1 ring-[var(--admin-border-fuerte)]"
      : !estaEnElMes || pasado
        ? "text-[var(--admin-texto-muted)] opacity-40 cursor-not-allowed"
        : !disponible
          ? "text-[var(--admin-texto-muted)] opacity-50 cursor-not-allowed"
          : "text-[var(--admin-texto-primario)] hover:bg-[var(--page-primary-20)] cursor-pointer";

  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      onClick={() => onSeleccionar(dia)}
      disabled={!estaEnElMes || pasado || !disponible}
      className={`h-10 w-full rounded-lg text-sm transition flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] ${
        esHoy && !seleccionado ? "ring-1 ring-[var(--admin-border-fuerte)] ring-inset" : ""
      } ${clases}`}
    >
      {/* Días de otro mes: el número queda invisible para mantener la grilla prolija */}
      <span className={!estaEnElMes ? "invisible" : undefined}>{format(dia, "d")}</span>
      {disponible && !seleccionado && (
        <span className="mx-auto mt-0.5 block h-1 w-1 rounded-full bg-[var(--page-primary-70)]" />
      )}
    </button>
  );
}
