"use client";

import GrillaCalendario from "./GrillaCalendario";
import ListaHorarios from "./ListaHorarios";
import { useDisponibilidadHorarios } from "@/hooks/useDisponibilidadHorarios";

interface Props {
  servicioId?: string;
  barberoId?: string;
  turnoIdAExcluir?: string;
  defaultValue?: string;
  name: string;
  sessionId?: string;
  userId?: string;
}

/**
 * Seleccionador de fecha y horario para el formulario de turnos.
 * Compone el calendario del mes y la cuadrícula de horarios disponibles.
 */
export default function SeleccionadorHorario({
  servicioId,
  barberoId,
  turnoIdAExcluir,
  defaultValue,
  name,
  sessionId = "no-session",
  userId = "no-user",
}: Props) {
  const {
    fecha,
    mesVisible,
    diasDisponibles,
    cargandoDias,
    slots,
    cargando,
    slotSeleccionado,
    isSlotBloqueado,
    irAlMesAnterior,
    irAlMesSiguiente,
    manejarSeleccionFecha,
    manejarSeleccionSlot,
  } = useDisponibilidadHorarios({
    servicioId,
    barberoId,
    turnoIdAExcluir,
    defaultValue,
    sessionId,
    userId,
  });

  return (
    <div className="space-y-4">
      {/* Campo oculto para enviar el slot seleccionado en el formulario */}
      <input type="hidden" name={name} value={slotSeleccionado} />

      <GrillaCalendario
        mesVisible={mesVisible}
        diasDisponibles={diasDisponibles}
        fecha={fecha}
        cargandoDias={cargandoDias}
        onMesAnterior={irAlMesAnterior}
        onMesSiguiente={irAlMesSiguiente}
        onSeleccionarDia={manejarSeleccionFecha}
      />

      <ListaHorarios
        slots={slots}
        cargando={cargando}
        fecha={fecha}
        servicioId={servicioId}
        barberoId={barberoId}
        slotSeleccionado={slotSeleccionado}
        isSlotBloqueado={isSlotBloqueado}
        onSeleccionarSlot={manejarSeleccionSlot}
      />
    </div>
  );
}