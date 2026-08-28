"use client";

import { Check } from "lucide-react";
import type { PropsTarjetaBarberoReserva } from "@/components/turno/reserva/tipos";
import { cn } from "@/lib/utils/cn";

export default function TarjetaBarberoReserva({
  barbero,
  seleccionado,
  onSeleccionar,
}: PropsTarjetaBarberoReserva) {
  const inicial = barbero.nombre.trim().charAt(0).toUpperCase() || "?";

  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      onClick={() => onSeleccionar(barbero.id)}
      className={cn(
        "relative flex h-[116px] flex-col items-center gap-2 rounded-xl border p-4 transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]",
        seleccionado
          ? "border-[var(--page-primary)] bg-[var(--page-primary-15)]"
          : "border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] hover:border-[var(--page-primary-40)] hover:bg-white/[0.03]"
      )}
    >
      <div
        className={cn(
          "h-14 w-14 overflow-hidden rounded-full",
          seleccionado && "ring-2 ring-[var(--page-primary)] ring-offset-2 ring-offset-transparent"
        )}
      >
        {barbero.srcImage ? (
          <img src={barbero.srcImage} alt={barbero.nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--page-primary-30)] text-xl font-bold text-[var(--page-primary-tinta)]">
            {inicial}
          </div>
        )}
      </div>
      <span
        className={cn(
          "max-w-full truncate text-sm font-medium text-[var(--admin-texto-primario)]",
          seleccionado && "font-semibold text-[var(--page-primary-tinta)]"
        )}
      >
        {barbero.nombre}
      </span>
      {seleccionado && (
        <span className="absolute right-2 top-2 rounded-full bg-[var(--page-primary)] p-1 text-[var(--page-primary-foreground)]">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
