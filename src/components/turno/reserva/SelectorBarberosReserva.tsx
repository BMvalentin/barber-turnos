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
      <div className="py-2 text-sm text-[var(--admin-texto-muted)]">
        No hay barberos disponibles para reservar.
      </div>
    );
  }

  return (
    <div className="grid max-h-[244px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 in-[.reserva-publica]:max-h-none in-[.reserva-publica]:overflow-visible in-[.reserva-publica]:pr-0 in-[.reserva-publica]:lg:grid-cols-2 in-[.reserva-publica]:xl:grid-cols-3">
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
