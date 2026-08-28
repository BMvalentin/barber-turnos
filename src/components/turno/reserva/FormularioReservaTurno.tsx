"use client";

import { useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import type { PropsFormularioReservaTurno } from "@/components/turno/reserva/tipos";
import { useDisponibilidadHorarios } from "@/hooks/useDisponibilidadHorarios";
import PanelBarberoServicio from "@/components/turno/reserva/PanelBarberoServicio";
import PanelFechaHorario from "@/components/turno/reserva/PanelFechaHorario";
import ResumenReserva from "@/components/turno/reserva/ResumenReserva";

export default function FormularioReservaTurno({
  session,
  formRef,
  state,
  formAction,
  sessionId,
  servicios,
  barberos,
  usuarios,
  selectedServicioId,
  selectedBarberoId,
  selectedUserId,
  setSelectedUserId,
  serviciosFiltrados,
  handleBarberoChange,
  handleServicioChange,
  onCancelar,
  turnoInicial,
}: PropsFormularioReservaTurno) {
  const disponibilidad = useDisponibilidadHorarios({
    servicioId: selectedServicioId,
    barberoId: selectedBarberoId,
    sessionId,
    userId: selectedUserId,
    turnoIdAExcluir: turnoInicial?.id,
    defaultValue: turnoInicial?.horarioReservado.toISOString(),
  });

  useEffect(() => {
    if (state.error) {
      toast.error("Error", { description: state.error });
    }
  }, [state]);

  const servicio = servicios.find((s) => s.id === selectedServicioId) ?? null;
  const barbero = barberos.find((b) => b.id === selectedBarberoId) ?? null;

  const esUsuarioNormal = session?.user?.role === "USER";
  const clienteCompleto = esUsuarioNormal || Boolean(selectedUserId);
  const completo = Boolean(
    selectedServicioId &&
      selectedBarberoId &&
      disponibilidad.fecha &&
      disponibilidad.slotSeleccionado &&
      clienteCompleto,
  );

  const manejarEnvio = (e: FormEvent<HTMLFormElement>) => {
    if (completo) return;
    e.preventDefault();
    if (!selectedBarberoId) {
      toast.error("Elegí un barbero.", {
        description: "Seleccioná el barbero que realizará el turno.",
      });
    } else if (!selectedServicioId) {
      toast.error("Elegí un servicio.", {
        description: "Seleccioná el servicio para tu turno.",
      });
    } else if (!disponibilidad.fecha) {
      toast.error("Elegí una fecha.", {
        description: "Seleccioná el día de tu turno.",
      });
    } else if (!disponibilidad.slotSeleccionado) {
      toast.error("Elegí un horario.", {
        description: "Seleccioná un horario disponible.",
      });
    } else if (!clienteCompleto) {
      toast.error("Elegí un cliente.", {
        description: "Seleccioná el cliente que tomará el turno.",
      });
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={manejarEnvio}
      className="flex flex-1 min-h-0 flex-col gap-5 overflow-y-auto p-5 sm:p-6 lg:overflow-hidden"
    >
      <input type="hidden" name="servicioId" value={selectedServicioId} />
      <input type="hidden" name="barberoId" value={selectedBarberoId} />
      {turnoInicial && <input type="hidden" name="id" value={turnoInicial.id} />}
      <input
        type="hidden"
        name="horarioReservado"
        value={disponibilidad.slotSeleccionado}
      />

      <div className="grid grid-cols-1 gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[340px_minmax(0,1fr)_320px] lg:gap-6">
        <div className="flex min-w-0 flex-col lg:order-2 lg:min-h-0 lg:overflow-hidden">
          <PanelBarberoServicio
            barberos={barberos}
            selectedBarberoId={selectedBarberoId}
            onSeleccionarBarbero={handleBarberoChange}
            serviciosFiltrados={serviciosFiltrados}
            selectedServicioId={selectedServicioId}
            onSeleccionarServicio={handleServicioChange}
          />
        </div>

        <div className="flex min-w-0 flex-col lg:order-1 lg:min-h-0 lg:overflow-hidden">
          <PanelFechaHorario
            disponibilidad={disponibilidad}
            servicioId={selectedServicioId}
            barberoId={selectedBarberoId}
          />
        </div>

        <div className="lg:order-3">
          <ResumenReserva
            servicio={servicio}
            barbero={barbero}
            fecha={disponibilidad.fecha}
            slotSeleccionado={disponibilidad.slotSeleccionado}
            completo={completo}
            onCancelar={onCancelar}
            esAdmin={session?.user?.role === "ADMIN"}
            usuarios={usuarios}
            selectedUserId={selectedUserId}
            onCambiarCliente={setSelectedUserId}
            esEdicion={Boolean(turnoInicial)}
          />
        </div>
      </div>
    </form>
  );
}
