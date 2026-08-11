"use client";

import { useState } from "react";
import EditTurnoModal from "./EditarTurnoModal";
import { Calendar, User, Scissors, DollarSign, Phone } from "lucide-react";
import { cancelTurno } from "@/actions/sesion/cancelar-turno.actions";
import { completedTurno } from "@/actions/turnos/completar.actions";
import { confirmarTurno } from "@/actions/turnos/confirmar.actions";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import EmptyState from "@/components/ui/EmptyState";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { ESTADOS_TURNO } from "@/lib/constants";
import { esAdmin } from "@/lib/seguridad/es-admin";
import type { TurnoListado } from "@/types/turno";
import type { Session } from "next-auth";

interface Props {
  turnos: TurnoListado[];
  session: Session | null;
}

type AccionConfirmacion = "cancelar" | "completar" | "confirmar";

export default function TurnoList({ turnos, session }: Props) {
  const turnosActivos = turnos.filter(
    (t) => t.estado === ESTADOS_TURNO[0] || t.estado === ESTADOS_TURNO[1]
  );

  // Estados del modal de confirmación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [accionConfirmacion, setAccionConfirmacion] = useState<AccionConfirmacion | null>(null);
  const [turnoIdConfirmacion, setTurnoIdConfirmacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { retroalimentar } = useRetroalimentacionAccion({
    descripcionError: "Hubo un error al intentar procesar la acción.",
  });

  // Solicitar cancelación
  const handleRequestCancel = (turnoId: string) => {
    setAccionConfirmacion("cancelar");
    setTurnoIdConfirmacion(turnoId);
    setMostrarConfirmacion(true);
  };

  // Solicitar completar
  const handleRequestComplete = (turnoId: string) => {
    setAccionConfirmacion("completar");
    setTurnoIdConfirmacion(turnoId);
    setMostrarConfirmacion(true);
  };

  // Cancelar (cerrar modal sin hacer nada)
  const cancelarConfirmacion = () => {
    setMostrarConfirmacion(false);
    setAccionConfirmacion(null);
    setTurnoIdConfirmacion(null);
    setIsLoading(false);
  };

  // Confirmar acción
  const confirmarAccion = async () => {
    if (!turnoIdConfirmacion || !accionConfirmacion) return;
    setIsLoading(true);

    try {
      if (accionConfirmacion === "cancelar") {
        await cancelTurno(turnoIdConfirmacion);
        await retroalimentar(
          { success: true },
          "Turno cancelado",
          "El turno se ha cancelado correctamente.",
        );
      } else if (accionConfirmacion === "completar") {
        const formData = new FormData();
        formData.append("id", turnoIdConfirmacion);
        await completedTurno({ success: false }, formData);
        await retroalimentar(
          { success: true },
          "Turno completado",
          "El turno se ha marcado como completado.",
        );
      } else if (accionConfirmacion === "confirmar") {
        await confirmarTurno(turnoIdConfirmacion);
        await retroalimentar(
          { success: true },
          "Turno confirmado",
          "El turno se ha confirmado correctamente.",
        );
      }
    } catch {
      await retroalimentar({ success: false });
    } finally {
      setIsLoading(false);
      cancelarConfirmacion();
    }
  };

  const getModalMessage = () => {
    if (accionConfirmacion === "cancelar") {
      return "¿Estás seguro de que querés cancelar este turno? Esta acción no se puede deshacer.";
    }
    if (accionConfirmacion === "completar") {
      return "¿Marcar este turno como completado? El cliente recibirá una notificación.";
    }
    if (accionConfirmacion === "confirmar") {
      return "¿Estás seguro de que querés confirmar este turno?";
    }
    return "";
  };

  const getModalTitle = () => {
    if (accionConfirmacion === "cancelar") return "Cancelar Turno";
    if (accionConfirmacion === "completar") return "Completar Turno";
    if (accionConfirmacion === "confirmar") return "Confirmar Turno";
    return "";
  };

  if (!turnosActivos.length) {
    return (
      <EmptyState
        mensaje="No hay turnos activos (pendientes o confirmados)"
        claseContenedor="bg-black/40 backdrop-blur-lg border rounded-lg p-8"
        estiloContenedor={{ borderColor: "var(--page-primary-30)" }}
        estiloMensaje={{ color: "var(--page-primary-70)" }}
      />
    );
  }

  return (
    // INYECTAMOS LOS COLORES COMO VARIABLES CSS AQUÍ
    <div 
      className="space-y-6 w-full max-w-full overflow-hidden"
      style={{
        "--primary": "var(--page-primary)",
        "--secondary": "var(--page-secondary)",
        "--primary-foreground": "var(--page-primary-foreground)",
        "--primary-tinta": "var(--page-primary-tinta)",
      } as React.CSSProperties}
    >
      {/* Grid de Turnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {turnosActivos.map((turno) => (
          <TurnoCard
            key={turno.id}
            turno={turno}
            session={session}
            onCancelRequest={handleRequestCancel}
            onCompleteRequest={handleRequestComplete}
            onConfirmRequest={(id) => {
              setAccionConfirmacion("confirmar");
              setTurnoIdConfirmacion(id);
              setMostrarConfirmacion(true);
            }}
          />
        ))}
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <ConfirmDialog
          title={getModalTitle()}
          message={getModalMessage()}
          onConfirm={confirmarAccion}
          onCancel={cancelarConfirmacion}
        />
      )}
    </div>
  );
}

// ---- Subcomponente TurnoCard ----

function TurnoCard({
  turno,
  session,
  onCancelRequest,
  onCompleteRequest,
  onConfirmRequest,
}: {
  turno: TurnoListado;
  session: Session | null;
  onCancelRequest: (id: string) => void;
  onCompleteRequest: (id: string) => void;
  onConfirmRequest: (id: string) => void;
}) {
  const [isCanceling] = useState(false);
  const [isCompleting] = useState(false);
  const [isConfirming] = useState(false);

  const estadoColors = {
    PENDIENTE: "bg-[var(--page-primary)]/20 text-[var(--page-primary)] border-[var(--page-primary)]/50",
    CONFIRMADO: "bg-green-500/20 text-green-500 border-green-500/50",
    COMPLETADO: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    CANCELADO: "bg-red-500/20 text-red-500 border-red-500/50",
  };

  const handleCancel = () => onCancelRequest(turno.id);
  const handleCompletar = () => onCompleteRequest(turno.id);
  const handleConfirmar = () => onConfirmRequest(turno.id);

  return (
    <div className="bg-black/40 backdrop-blur-lg border border-[var(--primary)]/30 rounded-xl shadow-lg p-4 sm:p-5 hover:border-[var(--primary)]/50 transition-all w-full box-border">
      {/* Header con Estado */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--primary)]/30">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${estadoColors[turno.estado]}`}>
          {turno.estado}
        </span>
      </div>

      {/* Información del Turno */}
      <div className="space-y-3">
        {/* Cliente */}
        <div className="flex items-start gap-2 min-w-0">
          <User className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--secondary)]">Cliente</p>
            <p className="font-semibold text-white text-sm truncate">
              {turno.user?.name || turno.user?.email || "Usuario eliminado"}
            </p>
          </div>
        </div>

        {/* Teléfono */}
        <div className="flex items-start gap-2">
          <Phone className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--secondary)]">Teléfono</p>
            {turno.user?.telefono ? (
              <a
                href={`https://wa.me/${turno.user.telefono.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-semibold text-white hover:text-[var(--primary)] hover:underline truncate transition-colors"
              >
                {turno.user.telefono}
              </a>
            ) : (
              <p className="text-xs text-[var(--secondary)] truncate">Sin teléfono</p>
            )}
          </div>
        </div>

        {/* Servicio */}
        <div className="flex items-start gap-2">
          <Scissors className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--secondary)]">Servicio</p>
            <p className="font-semibold text-white text-sm">{turno.servicio?.nombre || "Servicio eliminado"}</p>
            <p className="text-xs text-[var(--secondary)]">{turno.servicio?.duracion || 0} min</p>
          </div>
        </div>

        {/* Barbero */}
        <div className="flex items-start gap-2">
          <div className="h-4 w-4 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-[10px] font-bold mt-0.5 flex-shrink-0">
            {turno.barbero?.nombre?.charAt(0) || "B"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--secondary)]">Barbero</p>
            <p className="font-semibold text-white text-sm">{turno.barbero?.nombre || "Barbero eliminado"}</p>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--secondary)]">Fecha y Hora</p>
            <p className="font-semibold text-white text-sm">
              {new Date(turno.horarioReservado).toLocaleDateString("es-AR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </p>
            <p className="text-xs text-[var(--secondary)]">
              {formatearHora(turno.horarioReservado)}
            </p>
          </div>
        </div>

        {/* Precio */}
        <div className="flex items-start gap-2 pt-3 border-t border-[var(--primary)]/30">
          <DollarSign className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--secondary)]">Total</p>
              <p className="font-bold text-[var(--primary-tinta)] text-lg">${turno.precioCongelado}</p>
            </div>
            {turno.seniaCongelada > 0 && (
              <div className="text-right">
                <p className="text-xs text-[var(--secondary)]">Seña</p>
                <p className="font-semibold text-green-500 text-sm">${turno.seniaCongelada}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      {(esAdmin(session) || (turno.user?.id === session?.user?.id && (turno.estado === ESTADOS_TURNO[0] || turno.estado === ESTADOS_TURNO[1]))) && (
        <div className="mt-4 pt-4 border-t border-[var(--primary)]/30">
          <div className="grid grid-cols-2 gap-2">
            {/* Opciones del USER (Dueño) */}
            {turno.user?.id === session?.user?.id && session?.user?.role !== "ADMIN" && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isCanceling}
                  className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-400/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
                >
                  {isCanceling ? "Cancelando..." : "Cancelar Turno"}
                </button>
                <EditTurnoModal turno={turno} />
              </>
            )}

            {/* Opciones del ADMIN */}
            {esAdmin(session) && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isCanceling}
                  className="col-span-1 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all bg-red-950/20 border-red-900/50 text-red-400 hover:bg-red-900/40"
                >
                  {isCanceling ? "Cancelando..." : "Cancelar"}
                </button>

                <button
                  onClick={handleCompletar}
                  disabled={isCompleting}
                  className="col-span-1 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all bg-blue-950/20 border-blue-900/50 text-blue-400 hover:bg-blue-900/40"
                >
                  {isCompleting ? "Completando..." : "Completar"}
                </button>

                <button
                  onClick={handleConfirmar}
                  disabled={isConfirming}
                  className="col-span-1 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all bg-green-950/20 border-green-900/50 text-green-400 hover:bg-green-900/40"
                >
                  {isConfirming ? "Confirmando..." : "Confirmar"}
                </button>

                <div className="col-span-1">
                  <EditTurnoModal turno={turno} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}