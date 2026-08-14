"use client";

import type { RefObject } from "react";
import type { Session } from "next-auth";
import type { ActionState } from "@/types/action-state";
import type { BarberoData, ServicioData, UsuarioData } from "@/types/turno";
import SeleccionadorHorario from "./SeleccionadorHorario";
import SeccionBarbero from "./SeccionBarbero";
import SeccionCliente from "./SeccionCliente";
import SeccionServicio from "./SeccionServicio";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";

type Props = {
  session: Session | null;
  formRef: RefObject<HTMLFormElement | null>;
  state: ActionState;
  formAction: (formData: FormData) => void;
  sessionId: string;
  servicios: ServicioData[];
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
  return (
    <form ref={formRef} action={formAction} className="p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SeccionCliente
          session={session}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          usuarios={usuarios}
        />

        <SeccionBarbero
          selectedBarberoId={selectedBarberoId}
          selectedServicioId={selectedServicioId}
          barberosFiltrados={barberosFiltrados}
          handleBarberoChange={handleBarberoChange}
        />

        <SeccionServicio
          selectedServicioId={selectedServicioId}
          servicios={servicios}
          serviciosFiltrados={serviciosFiltrados}
          handleServicioChange={handleServicioChange}
        />
      </div>

      {/* FECHA Y HORA */}
      <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
        <SeleccionadorHorario
          name="horarioReservado"
          servicioId={selectedServicioId}
          barberoId={selectedBarberoId}
          sessionId={sessionId}
          userId={selectedUserId}
        />
      </div>

      {state.error && (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/30">
          {state.error}
        </div>
      )}

      {/* Botones de acción inferior */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={onCancelar}
          className="px-6 py-2.5 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition-colors font-medium text-sm"
        >
          Cancelar
        </button>
        <BotonSubmitFormStatus
          texto="Confirmar Reserva"
          textoMientrasCarga="Procesando..."
          mostrarSpinner={false}
          claseAdicional="px-6 py-2.5 font-medium rounded-xl shadow-md hover:opacity-90 text-sm"
        />
      </div>
    </form>
  );
}