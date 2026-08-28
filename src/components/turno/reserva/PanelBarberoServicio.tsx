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
    <section className="flex min-h-0 flex-col gap-6 lg:overflow-hidden">
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
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--admin-border)] p-4 text-sm text-[var(--admin-texto-muted)]">
            <Scissors className="h-5 w-5 shrink-0 text-[var(--page-primary-tinta)]" />
            Elegí un barbero para ver los servicios disponibles.
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--admin-border)] p-4 text-sm text-[var(--admin-texto-muted)]">
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
