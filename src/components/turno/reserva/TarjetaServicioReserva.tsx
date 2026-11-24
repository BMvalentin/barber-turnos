"use client";

import { Check } from "lucide-react";
import type { PropsTarjetaServicioReserva } from "@/components/turno/reserva/tipos";
import { cn } from "@/lib/utils/cn";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

export default function TarjetaServicioReserva({
  servicio,
  seleccionado,
  onSeleccionar,
}: PropsTarjetaServicioReserva) {
  const mostrarDescripcion =
    typeof servicio.descripcion === "string" && servicio.descripcion.trim() !== "";

  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      onClick={() => onSeleccionar(servicio.id)}
      className={cn(
        "relative flex min-w-0 flex-col gap-1 rounded-xl border p-4 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]",
        "in-[.reserva-publica]:rounded-lg in-[.reserva-publica]:p-3 in-[.reserva-publica]:transition-colors in-[.reserva-publica]:focus-visible:ring-offset-2 in-[.reserva-publica]:focus-visible:ring-offset-[var(--admin-surface)]",
        seleccionado
          ? "border-[var(--admin-border-fuerte)] bg-[var(--admin-item)]"
          : "border-[var(--page-separador)] bg-[var(--admin-surface-elevated)] hover:bg-[var(--admin-item-hover)]"
      )}
    >
      <span
        className={cn(
          "max-w-full text-sm font-semibold text-[var(--admin-texto-primario)] [overflow-wrap:anywhere]",
          seleccionado && "in-[.reserva-publica]:pr-5",
        )}
      >
        {servicio.nombre}
      </span>
      <span className="text-xs text-[var(--admin-texto-muted)]">
        {servicio.duracion} min ·{" "}
        <span className="font-semibold text-[var(--admin-texto-primario)]">
          ${formatearMoneda(servicio.precio)}
        </span>
      </span>
      {mostrarDescripcion && (
        <p className="line-clamp-2 break-words text-xs text-[var(--admin-texto-muted)] [overflow-wrap:anywhere]">
          {servicio.descripcion}
        </p>
      )}
      {seleccionado && (
        <span aria-hidden="true" className="absolute right-2 top-2 rounded-full bg-[var(--page-primary)] p-1 text-[var(--page-primary-foreground)] in-[.reserva-publica]:border in-[.reserva-publica]:border-[var(--admin-border-fuerte)]">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
