"use client";

import TarjetaBarberoReserva from "@/components/turno/reserva/TarjetaBarberoReserva";
import type { PropsSelectorBarberosReserva } from "@/components/turno/reserva/tipos";

export default function SelectorBarberosReserva({
  barberos,
  seleccionadoId,
  onSeleccionar,
}: PropsSelectorBarberosReserva) {
  if (barberos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--admin-border)] p-4 text-sm text-[var(--admin-texto-muted)]">
        No hay barberos disponibles para reservar.
      </div>
    );
  }

  return (
    // El selector mantiene una altura acotada y permite desplazarse cuando
    // hay más barberos o algún nombre ocupa varias líneas.
    <div className="grid max-h-[244px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
      {barberos.map((barbero) => (
        <TarjetaBarberoReserva
          key={barbero.id}
          barbero={barbero}
          seleccionado={barbero.id === seleccionadoId}
          onSeleccionar={onSeleccionar}
        />
      ))}
    </div>
  );
}
