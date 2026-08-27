"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { actualizarTurno } from "@/actions/turnos/estado.actions";
import { useConfiguracionTurno } from "@/hooks/useConfiguracionTurno";
import { useSessionId } from "@/hooks/useSessionId";
import { useDisponibilidadHorarios } from "@/hooks/useDisponibilidadHorarios";
import SeleccionadorHorario from "./SeleccionadorHorario";
import SelectorBarberoTarjetas from "./SelectorBarberoTarjetas";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { DialogContent } from "@/components/ui/dialog/DialogContent";
import { DialogHeader } from "@/components/ui/dialog/DialogHeader";
import { DialogTitle } from "@/components/ui/dialog/DialogTitle";
import { DialogTrigger } from "@/components/ui/dialog/DialogTrigger";
import {
  Clock,
  Users,
  Scissors,
  User,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { ESTADOS_TURNO } from "@/lib/constants";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";
import { ActionStateInicial } from "@/types/action-state";
import type { TurnoListado } from "@/types/turno";

const estadoInicial = ActionStateInicial;

interface Props {
  turno: TurnoListado;
  userId?: string;
  claseTrigger?: string;
  onTriggerClick?: () => void;
}

export default function EditTurnoModal({
  turno,
  userId = "",
  claseTrigger,
  onTriggerClick,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const { datos, cargando, error, recargar } = useConfiguracionTurno(abierto);
  const servicios = datos.servicios;
  const barberos = datos.barberos;
  const cargandoDatos = cargando;
  const errorCarga = error
    ? "No se pudo cargar la configuración. Intente cerrando y abriendo el formulario."
    : null;

  // sessionId único por instancia del modal
  const sessionId = useSessionId();

  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState(
    turno.servicio?.id || ""
  );
  const [barberoSeleccionadoId, setBarberoSeleccionadoId] = useState(
    turno.barbero?.id || ""
  );
  const formularioRef = useRef<HTMLFormElement>(null);

  const disponibilidad = useDisponibilidadHorarios({
    servicioId: servicioSeleccionadoId,
    barberoId: barberoSeleccionadoId,
    turnoIdAExcluir: turno.id,
    defaultValue: turno.horarioReservado.toISOString(),
    sessionId,
    userId: userId || turno.user?.id || "",
    activo: abierto,
  });

  const [state, formAction] = useActionState(actualizarTurno, estadoInicial);

  // Cerrar modal y recargar página al guardar con éxito
  useEffect(() => {
    if (state.success) {
      setAbierto(false);
      window.location.reload();
    }
  }, [state]);

  useEffect(() => {
    if (state.error) {
      toast.error("Error", { description: state.error });
    }
  }, [state]);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <button
          onClick={onTriggerClick}
          className={claseTrigger ?? "w-full bg-[var(--page-primary)]/10 hover:bg-[var(--page-primary)]/20 text-[var(--page-primary)] border border-[var(--page-primary)]/20 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"}
        >
          Editar Turno
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl bg-[#14110C] border-[#2C261D] p-0 overflow-hidden shadow-2xl [&>button]:hidden">
      <form
        ref={formularioRef}
        action={formAction}
        className="flex flex-col flex-1 overflow-hidden"
      >
        {/* Input oculto con el ID del turno */}
        <input type="hidden" name="id" value={turno.id} />

        {/* --- ENCABEZADO DEL MODAL --- */}
        <div className="flex items-center justify-between p-6 border-b border-[#2C261D] bg-[#1a1610]/50 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setAbierto(false)}
              type="button"
              className="p-2 hover:bg-[var(--page-primary)]/20 rounded-lg transition-all group"
            >
              <ArrowLeft className="h-6 w-6 text-[var(--page-primary)] group-hover:text-[var(--page-primary-80)] group-hover:-translate-x-1 transition-all" />
            </button>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-[#E4E0D9]">
                  Gestionar Turno:{" "}
                  <span className="font-normal text-[#8E8675]">
                    #{turno.id.slice(-6)}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${turno.estado === ESTADOS_TURNO[1]
                      ? "bg-green-500"
                      : turno.estado === ESTADOS_TURNO[0]
                        ? "bg-[var(--page-primary)]"
                        : turno.estado === ESTADOS_TURNO[2]
                          ? "bg-blue-500"
                          : "bg-red-500"
                    }`}
                />
                <span className="text-[10px] font-bold text-[#8E8675] uppercase tracking-widest">
                  {turno.estado}
                </span>
              </div>
            </div>
          </div>

          <BotonSubmitFormStatus
            texto="Guardar Cambios"
            textoMientrasCarga="Guardando"
            claseAdicional="h-auto bg-[#E8B031] hover:bg-[#d49f2c] text-black font-bold text-[11px] uppercase tracking-widest py-3 px-10 rounded-xl shadow-xl shadow-amber-900/10"
          />
        </div>

        {/* --- CUERPO DEL FORMULARIO --- */}
        <div className="overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[75vh]">
          {cargandoDatos ? (
            /* Estado: cargando datos del servidor */
            <div className="col-span-2 py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#E8B031] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#8E8675]">
                Cargando configuración del servidor...
              </p>
            </div>
          ) : errorCarga ? (
            /* Estado: error al cargar datos */
            <div className="col-span-2 py-16 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500/60 mx-auto" />
              <p className="text-sm text-red-400">{errorCarga}</p>
              <button
                type="button"
                onClick={() => void recargar()}
                className="px-6 py-2 bg-[var(--page-primary)]/20 hover:bg-[var(--page-primary)]/30 text-[var(--page-primary-80)] border border-[var(--page-primary)]/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* Columna Izquierda: INFORMACIÓN & SERVICIO */}
              <div className="space-y-8">
                {/* SECCIÓN CLIENTE */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-[#E8B031] uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Información del Cliente
                  </h3>
                  <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-5 space-y-1">
                    <p className="text-lg font-semibold text-[#E4E0D9]">
                      {turno.user?.name || "Usuario eliminado"}
                    </p>
                    <p className="text-sm text-[#8E8675]">
                      {turno.user?.email}
                    </p>
                    <div className="pt-3 mt-3 border-t border-[#2C261D] flex justify-between items-center text-[11px]">
                      <span className="text-[#8E8675]">Total a pagar:</span>
                      <span className="font-bold text-[var(--page-primary-tinta)] text-sm">
                        ${turno.precioCongelado}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN SERVICIO & BARBERO */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-[#E8B031] uppercase tracking-widest flex items-center gap-2">
                    <Scissors className="w-3 h-3" />
                    Servicio y Estética
                  </h3>

                  <div className="grid gap-4">
                    <CampoSelect
                      label="Cambiar Servicio"
                      name="servicioId"
                      value={servicioSeleccionadoId}
                      onChange={(e) =>
                        setServicioSeleccionadoId(e.target.value)
                      }
                      icono={Scissors}
                      opciones={servicios.map((s) => ({
                        value: s.id,
                        label: `${s.nombre} ($${s.precio})`,
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Columna Derecha: AGENDA & HORARIOS */}
              <div className="space-y-8 bg-[#1a1610]/40 p-6 rounded-2xl border border-[#2C261D]">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-[#E8B031] uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Nueva Agenda (Opcional)
                  </h3>

                  <div className="p-4 bg-[var(--page-primary)]/5 border border-[var(--page-primary)]/10 rounded-xl mb-6">
                    <p className="text-[11px] text-amber-200/50 leading-relaxed italic">
                      Si solo necesitas cambiar el estado del turno, puedes
                      dejar la sección de agenda sin modificar. Tus cambios se
                      guardarán automáticamente.
                    </p>
                  </div>

                  <SeleccionadorHorario
                    name="horarioReservado"
                    servicioId={servicioSeleccionadoId}
                    barberoId={barberoSeleccionadoId}
                    disponibilidad={disponibilidad}
                  />
                </div>
              </div>

              {/* Barbero a todo el ancho */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-[10px] font-bold text-[#E8B031] uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Asignar Barbero
                </h3>
                <SelectorBarberoTarjetas
                  name="barberoId"
                  barberos={barberos}
                  seleccionadoId={barberoSeleccionadoId}
                  onChange={(id) => setBarberoSeleccionadoId(id)}
                />
              </div>
            </>
          )}
        </div>
      </form>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENTES AUXILIARES ---

interface CampoSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icono: React.ElementType;
  opciones: { value: string; label: string }[];
}

function CampoSelect({
  label,
  name,
  value,
  onChange,
  icono: Icono,
  opciones,
}: CampoSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        <Icono className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8675]" />
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-[#1C1812] border border-[#2C261D] rounded-xl pl-11 pr-4 py-3 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-all appearance-none cursor-pointer"
        >
          {opciones.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}