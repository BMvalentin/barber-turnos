"use client";

import { useState } from "react";
import EditTurnoModal from "./EditarTurnoModal";
import { Calendar, User, Scissors, DollarSign, CreditCard, Loader2, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { cancelTurno } from "@/actions/user-dashboard";
import { completedTurno, confirmarTurno } from "@/actions/turno.actions";
import { crearPreferenciaPago } from "@/actions/mercadopago-actions";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-modal";

type Turno = {
  id: string;
  horarioReservado: Date;
  precioCongelado: number;
  seniaCongelada: number;
  estado: "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | "COMPLETADO";
  user: {
    id: string;
    name: string | null;
    email: string | null;
    telefono: string | null;
  };
  servicio: {
    id: string;
    nombre: string;
    duracion: number;
  };
  barbero: {
    id: string;
    nombre: string;
  };
};

interface Props {
  turnos: Turno[];
  session: any;
  totalPages: number;
  currentPage: number;
}

type AccionConfirmacion = "cancelar" | "completar" | "confirmar";

export default function TurnoList({ turnos, session }: Props) {
  const turnosActivos = turnos.filter(
    (t) => t.estado === "PENDIENTE" || t.estado === "CONFIRMADO"
  );

  // Estados del modal de confirmación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [accionConfirmacion, setAccionConfirmacion] = useState<AccionConfirmacion | null>(null);
  const [turnoIdConfirmacion, setTurnoIdConfirmacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        toast({
          title: "Turno cancelado",
          description: "El turno se ha cancelado correctamente.",
          variant: "default",
          duration: 4000,
        });
      } else if (accionConfirmacion === "completar") {
        const formData = new FormData();
        formData.append("id", turnoIdConfirmacion);
        await completedTurno({ success: false }, formData);
        toast({
          title: "Turno completado",
          description: "El turno se ha marcado como completado.",
          variant: "default",
          duration: 4000,
        });
      }
    } catch {
      toast({
        title: "Error",
        description:
          accionConfirmacion === "cancelar"
            ? "Hubo un error al intentar cancelar el turno."
            : "Hubo un error al intentar completar el turno.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
      cancelarConfirmacion();
    }
  };

  // Determinar mensaje según acción
  const getModalMessage = () => {
    if (accionConfirmacion === "cancelar") {
      return "¿Estás seguro de que querés cancelar este turno? Esta acción no se puede deshacer.";
    }
    if (accionConfirmacion === "completar") {
      return "¿Marcar este turno como completado? El cliente recibirá una notificación.";
    }
    return "";
  };

  const getModalTitle = () => {
    return accionConfirmacion === "cancelar" ? "Cancelar Turno" : "Completar Turno";
  };

  if (!turnosActivos.length) {
    return (
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-lg p-8 text-center">
        <p className="text-amber-200/70">No hay turnos activos (pendientes o confirmados)</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Grid de Turnos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  turno: Turno;
  session: any;
  onCancelRequest: (id: string) => void;
  onCompleteRequest: (id: string) => void;
  onConfirmRequest: (id: string) => void;
}) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const estadoColors = {
    PENDIENTE: "bg-amber-500/20 text-amber-500 border-amber-500/50",
    CONFIRMADO: "bg-green-500/20 text-green-500 border-green-500/50",
    COMPLETADO: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    CANCELADO: "bg-red-500/20 text-red-500 border-red-500/50",
  };

  // Manejar cancelación (abre modal)
  const handleCancel = () => {
    onCancelRequest(turno.id);
  };

  // Manejar completar (abre modal)
  const handleCompletar = () => {
    onCompleteRequest(turno.id);
  };

  const handleConfirmar = () => {
    onConfirmRequest(turno.id);
  }

  const handlePagarSenia = async () => {
    setIsPaying(true);
    setPayError(null);
    try {
      const result = await crearPreferenciaPago(turno.id);
      if (!result.success || !result.data?.checkoutUrl) {
        setPayError(result.error ?? "No se pudo generar el enlace de pago");
        return;
      }
      window.location.href = result.data.checkoutUrl;
    } catch {
      setPayError("Error inesperado al iniciar el pago");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl shadow-lg p-5 hover:border-amber-500/50 transition-all">
      {/* Header con Estado */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-900/30">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${estadoColors[turno.estado]}`}
        >
          {turno.estado}
        </span>
      </div>

      {/* Información del Turno */}
      <div className="space-y-3">
        {/* Cliente */}
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-200/50">Cliente</p>
            <p className="font-semibold text-white text-sm truncate">
              {turno.user?.name || turno.user?.email || "Usuario eliminado"}
            </p>
          </div>
        </div>

        {/**telefono  */}
        <div className="flex items-start gap-2">
          <Phone className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-200/50">Teléfono</p>
            {turno.user?.telefono ? (
              <a
                href={`https://wa.me/${turno.user.telefono.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-semibold text-white hover:text-amber-400 hover:underline truncate transition-colors"
              >
                {turno.user.telefono}
              </a>
            ) : (
              <p className="text-xs text-amber-200/50 truncate">Sin teléfono</p>
            )}
          </div>
        </div>

        {/* Servicio */}
        <div className="flex items-start gap-2">
          <Scissors className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-200/50">Servicio</p>
            <p className="font-semibold text-white text-sm">
              {turno.servicio?.nombre || "Servicio eliminado"}
            </p>
            <p className="text-xs text-amber-200/50">
              {turno.servicio?.duracion || 0} min
            </p>
          </div>
        </div>

        {/* Barbero */}
        <div className="flex items-start gap-2">
          <div className="h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold mt-0.5 flex-shrink-0">
            {turno.barbero?.nombre?.charAt(0) || "B"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-200/50">Barbero</p>
            <p className="font-semibold text-white text-sm">
              {turno.barbero?.nombre || "Barbero eliminado"}
            </p>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-200/50">Fecha y Hora</p>
            <p className="font-semibold text-white text-sm">
              {new Date(turno.horarioReservado).toLocaleDateString("es-AR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </p>
            <p className="text-xs text-amber-200/50">
              {new Date(turno.horarioReservado).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Precio */}
        <div className="flex items-start gap-2 pt-3 border-t border-amber-900/30">
          <DollarSign className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-200/50">Total</p>
              <p className="font-bold text-amber-500 text-lg">
                ${turno.precioCongelado}
              </p>
            </div>
            {turno.seniaCongelada > 0 && (
              <div className="text-right">
                <p className="text-xs text-amber-200/50">Seña</p>
                <p className="font-semibold text-green-500 text-sm">
                  ${turno.seniaCongelada}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      {
        (session?.user?.role === "ADMIN" || (turno.user?.id === session?.user?.id && (turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO"))) && (
          <div className="mt-4 pt-4 border-t border-amber-900/30 space-y-2">
            
            <div className="flex justify-end gap-2">
              {/* Opciones del USER (Dueño) */}
              {turno.user?.id === session?.user?.id && session?.user?.role !== "ADMIN" && (turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO") && (
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
              {session?.user?.role === "ADMIN" && (turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO") && (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isCanceling}
                    className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-400/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
                  >
                    {isCanceling ? "Cancelando..." : "Cancelar Turno"}
                  </button>
                  <button
                    onClick={handleCompletar}
                    disabled={isCompleting}
                    className="text-xs font-bold text-blue-500 hover:text-blue-400 bg-blue-400/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-colors border border-blue-500/20 disabled:opacity-50"
                  >
                    {isCompleting ? "Completando..." : "Marcar Completado"}
                  </button>
                  <button
                    onClick={handleConfirmar}
                    disabled={isConfirming}
                    className="text-xs font-bold text-green-500 hover:text-green-400 bg-green-400/10 hover:bg-green-500/20 px-4 py-2 rounded-lg transition-colors border border-green-500/20 disabled:opacity-50"
                  >
                    {isConfirming ? "Confirmando..." : "Confirmar"}
                  </button>
                </>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}