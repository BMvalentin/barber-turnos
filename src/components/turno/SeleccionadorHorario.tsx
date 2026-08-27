"use client";

import GrillaCalendario from "./GrillaCalendario";
import ListaHorarios from "./ListaHorarios";

/**
 * Datos de disponibilidad que vive en el padre (provenientes de
 * `useDisponibilidadHorarios`). El padre es dueño del estado.
 */
export type DatosDisponibilidadHorarios = {
  fecha: Date | undefined;
  mesVisible: Date;
  diasDisponibles: string[];
  cargandoDias: boolean;
  slots: string[];
  cargando: boolean;
  slotSeleccionado: string;
  isSlotBloqueado: (slot: string) => boolean;
  irAlMesAnterior: () => void;
  irAlMesSiguiente: () => void;
  manejarSeleccionFecha: (dia: Date) => void;
  manejarSeleccionSlot: (slot: string) => void;
};

type Props = {
  name: string;
  servicioId?: string;
  barberoId?: string;
  disponibilidad: DatosDisponibilidadHorarios;
};

/**
 * Seleccionador de fecha y horario para el formulario de turnos.
 * Componente presentacional: recibe el estado de disponibilidad por props.
 * Compone el calendario del mes y la cuadrícula de horarios disponibles.
 */
export default function SeleccionadorHorario({
  name,
  servicioId,
  barberoId,
  disponibilidad,
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
  } = disponibilidad;

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
