"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import type { PropsTarjetaBarberoReserva } from "@/components/turno/reserva/tipos";
import { nombreVisibleBarbero, obtenerNombreProfesional } from "@/lib/barberos/nombre-profesional";
import { cn } from "@/lib/utils/cn";

export default function TarjetaBarberoReserva({
  barbero,
  seleccionado,
  onSeleccionar,
}: PropsTarjetaBarberoReserva) {
  const nombre = nombreVisibleBarbero(barbero.nombre);
  const inicial = obtenerNombreProfesional(barbero.nombre)?.charAt(0).toUpperCase() ?? "?";

  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      onClick={() => onSeleccionar(barbero.id)}
      className={cn(
        "relative flex min-h-[116px] flex-col items-center gap-2 rounded-xl border p-4 transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]",
        "in-[.reserva-publica]:rounded-lg in-[.reserva-publica]:p-3 in-[.reserva-publica]:transition-colors in-[.reserva-publica]:focus-visible:ring-offset-2 in-[.reserva-publica]:focus-visible:ring-offset-[var(--admin-surface)]",
        seleccionado
          ? "border-[var(--admin-border-fuerte)] bg-[var(--admin-item)]"
          : "border-[var(--page-separador)] bg-[var(--admin-surface-elevated)] hover:bg-[var(--admin-item-hover)]"
      )}
    >
      <div
        className={cn(
          "size-14 shrink-0 overflow-hidden rounded-full",
          seleccionado && "ring-2 ring-[var(--page-primary)] ring-offset-2 ring-offset-[var(--admin-surface)] in-[.reserva-publica]:ring-[var(--admin-border-fuerte)]"
        )}
      >
        {barbero.srcImage ? (
          <Image src={barbero.srcImage} alt="" width={56} height={56} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--page-primary-30)] text-xl font-bold text-[var(--admin-texto-primario)] in-[.reserva-publica]:bg-[var(--tema-primario-suave)] in-[.reserva-publica]:text-[var(--tema-primario-suave-texto)]">
            {inicial}
          </div>
        )}
      </div>
      <span
        className={cn(
          "max-w-full break-words text-center text-sm font-medium leading-tight text-[var(--admin-texto-primario)] [overflow-wrap:anywhere]",
          seleccionado && "font-semibold text-[var(--admin-texto-primario)]"
        )}
      >
        {nombre}
      </span>
      {seleccionado && (
        <span aria-hidden="true" className="absolute right-2 top-2 rounded-full bg-[var(--page-primary)] p-1 text-[var(--page-primary-foreground)] in-[.reserva-publica]:border in-[.reserva-publica]:border-[var(--admin-border-fuerte)]">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
