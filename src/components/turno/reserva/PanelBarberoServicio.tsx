"use client";

import { Scissors } from "lucide-react";
import SelectorBarberosReserva from "@/components/turno/reserva/SelectorBarberosReserva";
import SelectorServiciosReserva from "@/components/turno/reserva/SelectorServiciosReserva";
import type { PropsPanelBarberoServicio } from "@/components/turno/reserva/tipos";

export default function PanelBarberoServicio({
  barberos,
  selectedBarberoId,
  onSeleccionarBarbero,
  serviciosFiltrados,
  selectedServicioId,
  onSeleccionarServicio,
}: PropsPanelBarberoServicio) {
  return (
    <section className="flex min-h-0 flex-col gap-6 lg:overflow-hidden in-[.reserva-publica]:lg:overflow-visible">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--admin-texto-primario)]">
          Elegí tu barbero
        </h2>
        <SelectorBarberosReserva
          barberos={barberos}
          seleccionadoId={selectedBarberoId}
          onSeleccionar={onSeleccionarBarbero}
        />
      </div>

      <div className="flex min-h-0 flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--admin-texto-primario)]">
          Elegí un servicio
        </h2>
        {!selectedBarberoId ? (
          <div className="flex items-center gap-3 py-2 text-sm text-[var(--admin-texto-muted)]">
            <Scissors className="size-5 shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />
            Elegí un barbero para ver los servicios disponibles.
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <div className="py-2 text-sm text-[var(--admin-texto-muted)]">
            Este barbero no tiene servicios disponibles para reservar.
          </div>
        ) : (
          <SelectorServiciosReserva
            servicios={serviciosFiltrados}
            seleccionadoId={selectedServicioId}
            onSeleccionar={onSeleccionarServicio}
          />
        )}
      </div>
    </section>
  );
}
