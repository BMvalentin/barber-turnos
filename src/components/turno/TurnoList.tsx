"use client";

import { useState } from "react";
import EditTurnoModal from "./EditarTurnoModal";
import { Calendar, User, Scissors, DollarSign, CreditCard, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cancelTurno } from "@/actions/user-dashboard";
import { completedTurno, confirmarTurno } from "@/actions/turno.actions";
import { crearPreferenciaPago } from "@/actions/mercadopago-actions";
import Link from "next/link";

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

export default function TurnoList({ turnos, session, totalPages, currentPage }: Props) {
  const turnosActivos = turnos.filter(
    (t) => t.estado === "PENDIENTE" || t.estado === "CONFIRMADO"
  );

  return (
    <div className="space-y-6">

      {/* 1. Mostramos el mensaje si está vacío, pero NO hacemos return temprano */}
      {turnosActivos.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-lg p-8 text-center">
          <p className="text-amber-200/70">No hay turnos activos en esta página.</p>
        </div>
      ) : (
        /* 2. Solo mostramos el grid si hay turnos */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turnosActivos.map((turno) => (
            <TurnoCard key={turno.id} turno={turno} session={session} />
          ))}
        </div>
      )}

      {/* 3. La paginación SIEMPRE se renderiza si hay más de 1 página total */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <Link
            href={`?page=${currentPage - 1}`}
            className={`p-2 rounded-lg bg-black/40 border border-amber-500/30 transition-all ${currentPage <= 1 ? "opacity-30 pointer-events-none" : "hover:bg-amber-500/20"}`}
          >
            <ChevronLeft className="w-6 h-6 text-amber-500" />
          </Link>

          <span className="text-amber-200 font-bold">
            Pág. {currentPage} de {totalPages}
          </span>

          <Link
            href={`?page=${currentPage + 1}`}
            className={`p-2 rounded-lg bg-black/40 border border-amber-500/30 transition-all ${currentPage >= totalPages ? "opacity-30 pointer-events-none" : "hover:bg-amber-500/20"}`}
          >
            <ChevronRight className="w-6 h-6 text-amber-500" />
          </Link>
        </div>
      )}
    </div>
  );
}



function TurnoCard({ turno, session }: { turno: Turno; session: any }) {
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

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de que querés cancelar este turno?")) return;
    setIsCanceling(true);
    try {
      await cancelTurno(turno.id);
    } catch {
      alert("Error al cancelar el turno");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleConfirmar = async () => {
    if (!confirm("¿Confirmar este turno?")) return;
    setIsConfirming(true);
    const result = await confirmarTurno(turno.id);
    if (!result.success) alert(result.error);
    setIsConfirming(false);
  };

  const handleCompletar = async () => {
    if (!confirm("¿Marcar este turno como completado?")) return;
    setIsCompleting(true);
    try {
      const formData = new FormData();
      formData.append("id", turno.id);
      await completedTurno({ success: false }, formData);
    } catch {
      alert("Error al completar el turno");
    } finally {
      setIsCompleting(false);
    }
  };

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
        <span className="text-xs text-amber-200/50">
          #{turno.id.slice(0, 8)}
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
      {(session?.user?.role === "ADMIN" || (turno.user?.id === session?.user?.id && (turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO"))) && (
        <div className="mt-4 pt-4 border-t border-amber-900/30 space-y-2">

          {/* Botón pagar seña: solo para el dueño del turno, PENDIENTE y con seña */}
          {turno.user?.id === session?.user?.id &&
            turno.estado === "PENDIENTE" &&
            turno.seniaCongelada > 0 && (
              <div className="space-y-1">
                <button
                  id={`btn-pagar-senia-${turno.id}`}
                  onClick={handlePagarSenia}
                  disabled={isPaying}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-zinc-950 font-black py-2.5 rounded-lg transition-all text-xs uppercase tracking-widest"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generando enlace...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      Pagar Seña · ${turno.seniaCongelada.toLocaleString("es-AR")}
                    </>
                  )}
                </button>
                {payError && (
                  <p className="text-xs text-red-400 text-center">{payError}</p>
                )}
              </div>
            )}

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
      )}
    </div>
  );
}
