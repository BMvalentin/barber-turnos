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
        "relative flex flex-col gap-1 rounded-xl border p-4 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]",
        seleccionado
          ? "border-[var(--admin-border-fuerte)] bg-[var(--admin-item)]"
          : "border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] hover:border-[var(--admin-border-fuerte)] hover:bg-[var(--admin-item-hover)]"
      )}
    >
      <span
        className={cn(
          "break-words text-sm font-semibold text-[var(--admin-texto-primario)]",
          seleccionado && "text-[var(--admin-texto-primario)]"
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
        <span className="absolute right-2 top-2 rounded-full bg-[var(--page-primary)] p-1 text-[var(--page-primary-foreground)]">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
