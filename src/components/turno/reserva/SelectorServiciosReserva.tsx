"use client";

import TarjetaServicioReserva from "@/components/turno/reserva/TarjetaServicioReserva";
import type { PropsSelectorServiciosReserva } from "@/components/turno/reserva/tipos";

export default function SelectorServiciosReserva({
  servicios,
  seleccionadoId,
  onSeleccionar,
}: PropsSelectorServiciosReserva) {
  return (
    <div className="grid max-h-[220px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
      {servicios.map((servicio) => (
        <TarjetaServicioReserva
          key={servicio.id}
          servicio={servicio}
          seleccionado={servicio.id === seleccionadoId}
          onSeleccionar={onSeleccionar}
        />
      ))}
    </div>
  );
}
