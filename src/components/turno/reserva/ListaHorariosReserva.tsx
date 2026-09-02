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
      <div className="border border-dashed border-[var(--admin-border)] rounded-xl p-4 text-sm text-[var(--admin-texto-muted)]">
        {mensaje}
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, indice) => (
          <div
            key={indice}
            className="h-11 animate-pulse rounded-lg bg-[var(--admin-border)]"
          />
        ))}
      </div>
    );
  }

  const slotsVisibles = slots.filter((slot) => !isSlotBloqueado(slot));

  if (slotsVisibles.length === 0) {
    return (
      <div className="border border-dashed border-[var(--admin-border)] rounded-xl p-4 flex items-center gap-3 text-sm text-[var(--admin-texto-muted)]">
        <CalendarX2 className="h-5 w-5 shrink-0 text-[var(--page-primary-tinta)]" />
        No hay horarios disponibles para esta fecha.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1">
      {slotsVisibles.map((slot) => {
        const seleccionado = slot === slotSeleccionado;
        const clases = seleccionado
          ? "border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] text-[var(--page-primary-foreground)] shadow-[0_0_10px_color-mix(in_srgb,var(--page-primary)_35%,transparent)] ring-1 ring-[var(--admin-border-fuerte)] cursor-pointer"
          : "border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] text-[var(--admin-texto-primario)] hover:border-[var(--admin-border-fuerte)] hover:bg-[var(--admin-item-hover)] cursor-pointer";

        return (
          <button
            key={slot}
            type="button"
            onClick={() => onSeleccionarSlot(slot)}
            aria-pressed={seleccionado}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] ${clases}`}
          >
            {seleccionado ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
            {formatearHora(slot)}
          </button>
        );
      })}
    </div>
  );
}
