"use client";

import { CalendarX2, Check } from "lucide-react";
import { formatearHora } from "@/lib/utils/formatear-hora";
import type { PropsListaHorariosReserva } from "@/components/turno/reserva/tipos";

export default function ListaHorariosReserva({
  slots,
  cargando,
  fecha,
  servicioId,
  barberoId,
  slotSeleccionado,
  isSlotBloqueado,
  onSeleccionarSlot,
}: PropsListaHorariosReserva) {
  if (!fecha || !servicioId || !barberoId) {
    const mensaje = !barberoId
      ? "Elegí un barbero para ver los horarios disponibles."
      : !servicioId
        ? "Elegí un servicio para ver los horarios disponibles."
        : "Elegí una fecha para ver los horarios disponibles.";

    return (
      <div className="py-2 text-sm text-[var(--admin-texto-muted)]">
        {mensaje}
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="status" aria-busy="true" aria-label="Cargando horarios">
        {Array.from({ length: 8 }).map((_, indice) => (
          <div
            key={indice}
            className="h-11 rounded-lg bg-[var(--admin-border)] motion-safe:animate-pulse"
          />
        ))}
      </div>
    );
  }

  const slotsVisibles = slots.filter((slot) => !isSlotBloqueado(slot));

  if (slotsVisibles.length === 0) {
    return (
      <div className="flex items-center gap-3 py-2 text-sm text-[var(--admin-texto-muted)]">
        <CalendarX2 className="size-5 shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />
        No hay horarios disponibles para esta fecha.
      </div>
    );
  }

  return (
    <div className="grid max-h-[160px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 in-[.reserva-publica]:max-h-none in-[.reserva-publica]:overflow-visible in-[.reserva-publica]:pr-0 in-[.reserva-publica]:lg:grid-cols-3 in-[.reserva-publica]:xl:grid-cols-4" role="group" aria-label="Horarios disponibles">
      {slotsVisibles.map((slot) => {
        const seleccionado = slot === slotSeleccionado;
        const clases = seleccionado
          ? "border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] text-[var(--page-primary-foreground)] shadow-[0_0_10px_color-mix(in_srgb,var(--page-primary)_35%,transparent)] ring-1 ring-[var(--admin-border-fuerte)] cursor-pointer in-[.reserva-publica]:shadow-none"
          : "border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] text-[var(--admin-texto-primario)] hover:border-[var(--admin-border-fuerte)] hover:bg-[var(--admin-item-hover)] cursor-pointer";

        return (
          <button
            key={slot}
            type="button"
            onClick={() => onSeleccionarSlot(slot)}
            aria-pressed={seleccionado}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] in-[.reserva-publica]:min-h-11 in-[.reserva-publica]:gap-1 in-[.reserva-publica]:tabular-nums in-[.reserva-publica]:transition-colors in-[.reserva-publica]:focus-visible:ring-offset-2 in-[.reserva-publica]:focus-visible:ring-offset-[var(--admin-surface)] ${clases}`}
          >
            {seleccionado ? <Check className="size-3.5 shrink-0" aria-hidden="true" /> : null}
            {formatearHora(slot)}
          </button>
        );
      })}
    </div>
  );
}
