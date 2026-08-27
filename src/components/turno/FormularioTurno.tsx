"use client";

import { useEffect, type FormEvent, type RefObject } from "react";
import type { Session } from "next-auth";
import { toast } from "sonner";
import type { ActionState } from "@/types/action-state";
import type { BarberoData, ServicioData, UsuarioData } from "@/types/turno";
import { useDisponibilidadHorarios } from "@/hooks/useDisponibilidadHorarios";
import SeleccionadorHorario from "./SeleccionadorHorario";
import SeccionBarbero from "./SeccionBarbero";
import SeccionServicio from "./SeccionServicio";
import SeccionConfirmacion from "./SeccionConfirmacion";
import ResumenTurno from "./ResumenTurno";

type Props = {
  session: Session | null;
  formRef: RefObject<HTMLFormElement | null>;
  state: ActionState;
  formAction: (formData: FormData) => void;
  sessionId: string;
  servicios: ServicioData[];
  barberos: BarberoData[];
  usuarios: UsuarioData[];
  selectedServicioId: string;
  selectedBarberoId: string;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  serviciosFiltrados: ServicioData[];
  barberosFiltrados: BarberoData[];
  handleBarberoChange: (id: string) => void;
  handleServicioChange: (id: string) => void;
  onCancelar: () => void;
};

export default function FormularioTurno({
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
  barberosFiltrados,
  handleBarberoChange,
  handleServicioChange,
  onCancelar,
}: Props) {
  const disponibilidad = useDisponibilidadHorarios({
    servicioId: selectedServicioId,
    barberoId: selectedBarberoId,
    sessionId,
    userId: selectedUserId,
  });

  useEffect(() => {
    if (state.error) {
      toast.error("Error", { description: state.error });
    }
  }, [state]);

  const servicio =
    servicios.find((s) => s.id === selectedServicioId) ?? null;
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
    if (!selectedServicioId) {
      toast.error("Elegí un servicio.", {
        description: "Seleccioná el servicio para tu turno.",
      });
    } else if (!selectedBarberoId) {
      toast.error("Elegí un barbero.", {
        description: "Seleccioná el barbero que realizará el turno.",
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
      className="p-6 md:p-8 space-y-6 flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:flex-1 lg:min-h-0">
        {/* Panel izquierdo: scroll independiente en desktop */}
        <div className="space-y-6 min-w-0 lg:overflow-y-auto lg:pr-1">
          <SeccionServicio
            selectedServicioId={selectedServicioId}
            servicios={servicios}
            serviciosFiltrados={serviciosFiltrados}
            handleServicioChange={handleServicioChange}
          />
          <SeccionBarbero
            selectedBarberoId={selectedBarberoId}
            selectedServicioId={selectedServicioId}
            barberosFiltrados={barberosFiltrados}
            handleBarberoChange={handleBarberoChange}
          />
          {/* FECHA Y HORA */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
            <SeleccionadorHorario
              name="horarioReservado"
              servicioId={selectedServicioId}
              barberoId={selectedBarberoId}
              disponibilidad={disponibilidad}
            />
          </div>
          <SeccionConfirmacion
            session={session}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            usuarios={usuarios}
          />
        </div>
        {/* Sidebar resumen */}
        <ResumenTurno
          servicio={servicio}
          barbero={barbero}
          fecha={disponibilidad.fecha}
          slotSeleccionado={disponibilidad.slotSeleccionado}
          completo={completo}
          onCancelar={onCancelar}
        />
      </div>
    </form>
  );
}
