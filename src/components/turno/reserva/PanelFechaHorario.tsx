"use client";

import CalendarioReserva from "@/components/turno/reserva/CalendarioReserva";
import ListaHorariosReserva from "@/components/turno/reserva/ListaHorariosReserva";
import type { PropsPanelFechaHorario } from "@/components/turno/reserva/tipos";

export default function PanelFechaHorario({
  disponibilidad,
  servicioId,
  barberoId,
}: PropsPanelFechaHorario) {
  const {
    mesVisible,
    diasDisponibles,
    cargandoDias,
    fecha,
    slots,
    cargando,
    slotSeleccionado,
    isSlotBloqueado,
    irAlMesAnterior,
    irAlMesSiguiente,
    manejarSeleccionFecha,
    manejarSeleccionSlot,
  } = disponibilidad;

  return (
    <section className="flex flex-col gap-4 lg:min-h-0 lg:overflow-hidden">
      <h2 className="text-lg font-semibold text-[var(--admin-texto-primario)]">
        Seleccioná una fecha
      </h2>

      <CalendarioReserva
        mesVisible={mesVisible}
        diasDisponibles={diasDisponibles}
        cargandoDias={cargandoDias}
        fecha={fecha}
        onMesAnterior={irAlMesAnterior}
        onMesSiguiente={irAlMesSiguiente}
        onSeleccionarDia={manejarSeleccionFecha}
      />

      <ListaHorariosReserva
        slots={slots}
        cargando={cargando}
        fecha={fecha}
        servicioId={servicioId}
        barberoId={barberoId}
        slotSeleccionado={slotSeleccionado}
        isSlotBloqueado={isSlotBloqueado}
        onSeleccionarSlot={manejarSeleccionSlot}
      />
    </section>
  );
}
