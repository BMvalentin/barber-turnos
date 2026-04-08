"use client";

import { useState } from "react";
import EditTurnoModal from "./EditarTurnoModal";
import { Calendar, User, Scissors, DollarSign, Filter } from "lucide-react";
import { cancelTurno } from "@/actions/user-dashboard";

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
}

type EstadoFiltro =
  | "TODOS"
  | "PENDIENTE"
  | "CONFIRMADO"
  | "CANCELADO"
  | "COMPLETADO";

export default function TurnoList({ turnos, session }: Props) {
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("TODOS");

  if (!turnos.length) {
    return (
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-lg p-8 text-center">
        <p className="text-amber-200/70">No hay turnos cargados</p>
      </div>
    );
  }

  const contadores = {
    TODOS: turnos.length,
    PENDIENTE: turnos.filter((t) => t.estado === "PENDIENTE").length,
    CONFIRMADO: turnos.filter((t) => t.estado === "CONFIRMADO").length,
    COMPLETADO: turnos.filter((t) => t.estado === "COMPLETADO").length,
    CANCELADO: turnos.filter((t) => t.estado === "CANCELADO").length,
  };

  const turnosFiltrados =
    filtroEstado === "TODOS"
      ? turnos
      : turnos.filter((t) => t.estado === filtroEstado);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-white">Filtrar por Estado</h3>
        </div>

        <div className="flex flex-wrap gap-3">
          <FilterButton
            label="Todos"
            count={contadores.TODOS}
            isActive={filtroEstado === "TODOS"}
            onClick={() => setFiltroEstado("TODOS")}
            color="amber"
          />
          <FilterButton
            label="Pendientes"
            count={contadores.PENDIENTE}
            isActive={filtroEstado === "PENDIENTE"}
            onClick={() => setFiltroEstado("PENDIENTE")}
            color="amber"
          />
          <FilterButton
            label="Confirmados"
            count={contadores.CONFIRMADO}
            isActive={filtroEstado === "CONFIRMADO"}
            onClick={() => setFiltroEstado("CONFIRMADO")}
            color="green"
          />
          <FilterButton
            label="Completados"
            count={contadores.COMPLETADO}
            isActive={filtroEstado === "COMPLETADO"}
            onClick={() => setFiltroEstado("COMPLETADO")}
            color="blue"
          />
          <FilterButton
            label="Cancelados"
            count={contadores.CANCELADO}
            isActive={filtroEstado === "CANCELADO"}
            onClick={() => setFiltroEstado("CANCELADO")}
            color="red"
          />
        </div>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-amber-200/50 text-sm">
          Mostrando{" "}
          <span className="text-white font-semibold">
            {turnosFiltrados.length}
          </span>{" "}
          {turnosFiltrados.length === 1 ? "turno" : "turnos"}
        </p>
      </div>

      {/* Grid de Turnos */}
      {turnosFiltrados.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-lg p-8 text-center">
          <p className="text-amber-200/70">
            No hay turnos con el estado seleccionado
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turnosFiltrados.map((turno) => (
            <TurnoCard key={turno.id} turno={turno} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  label,
  count,
  isActive,
  onClick,
  color,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  color: "amber" | "green" | "blue" | "red";
}) {
  const colorClasses = {
    amber: {
      active: "bg-amber-500 text-white border-amber-500",
      inactive:
        "bg-amber-500/10 text-amber-400 border-amber-500/50 hover:bg-amber-500/20",
    },
    green: {
      active: "bg-green-500 text-white border-green-500",
      inactive:
        "bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20",
    },
    blue: {
      active: "bg-blue-500 text-white border-blue-500",
      inactive:
        "bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-500/20",
    },
    red: {
      active: "bg-red-500 text-white border-red-500",
      inactive:
        "bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20",
    },
  };

  const classes = isActive
    ? colorClasses[color].active
    : colorClasses[color].inactive;

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border font-semibold text-sm transition-all flex items-center gap-2 backdrop-blur-sm ${classes}`}
    >
      {label}
      <span
        className={`px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-white/20" : "bg-black/20"}`}
      >
        {count}
      </span>
    </button>
  );
}

function TurnoCard({ turno, session }: { turno: Turno; session: any }) {
  const [isCanceling, setIsCanceling] = useState(false);
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
              {turno.user.name || turno.user.email}
            </p>
          </div>
        </div>

        {/* Servicio */}
        <div className="flex items-start gap-2">
          <Scissors className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-200/50">Servicio</p>
            <p className="font-semibold text-white text-sm">
              {turno.servicio.nombre}
            </p>
            <p className="text-xs text-amber-200/50">
              {turno.servicio.duracion} min
            </p>
          </div>
        </div>

        {/* Barbero */}
        <div className="flex items-start gap-2">
          <div className="h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold mt-0.5 flex-shrink-0">
            {turno.barbero.nombre.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-200/50">Barbero</p>
            <p className="font-semibold text-white text-sm">
              {turno.barbero.nombre}
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
      {(session?.user?.role === "ADMIN" || (turno.user.id === session?.user?.id && (turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO"))) && (
        <div className="mt-4 pt-4 border-t border-amber-900/30 flex justify-end gap-2">
          {turno.user.id === session?.user?.id && (turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO") && (
            <button 
              onClick={handleCancel}
              disabled={isCanceling}
              className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-400/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
            >
              {isCanceling ? "Cancelando..." : "Cancelar Turno"}
            </button>
          )}

          {session?.user?.role === "ADMIN" && (
            <EditTurnoModal turno={turno} />
          )}
        </div>
      )}
    </div>
  );
}
