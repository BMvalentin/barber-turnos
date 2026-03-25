"use client";

import { useActionState, useEffect, useState } from "react";
import { actualizarTurno } from "@/actions/turno.actions";
import SeleccionadorHorario from "./SeleccionadorHorario";
import { X, Calendar, User, Scissors, Users } from "lucide-react";

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

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  duracion: number;
  precio: any;
};

type Barbero = {
  id: string;
  nombre: string;
};

const initialState = {
  success: false,
  error: undefined as string | undefined,
};

interface Props {
  turno: Turno;
}

export default function EditTurnoModal({ turno }: Props) {
  const [open, setOpen] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedServicioId, setSelectedServicioId] = useState(turno.servicio.id);
  const [selectedBarberoId, setSelectedBarberoId] = useState(turno.barbero.id);

  const [state, formAction] = useActionState(actualizarTurno, initialState);

  // Cargar servicios y barberos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  async function loadData() {
    try {
      setLoadingData(true);
      const res = await fetch("/api/configuracion-turno");
      const data = await res.json();
      
      setServicios(data.servicios || []);
      setBarberos(data.barberos || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      // Recargar la página para ver los cambios
      window.location.reload();
    }
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        Editar Turno
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black/95 backdrop-blur-xl border border-amber-900/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-black/95 border-b border-amber-900/30 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Editar Turno</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-amber-200/70 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            {loadingData ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                <p className="text-amber-200/70 mt-4">Cargando datos...</p>
              </div>
            ) : (
              <form action={formAction} className="p-6 space-y-6">
                <input type="hidden" name="id" value={turno.id} />

                {/* Información del Cliente (Solo lectura) */}
                <div className="bg-black/60 border border-amber-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-amber-200/50">Cliente</p>
                      <p className="font-semibold text-white text-sm">
                        {turno.user.name || turno.user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cambiar Servicio */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-amber-500 flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Servicio
                  </label>
                  <select
                    name="servicioId"
                    value={selectedServicioId}
                    onChange={(e) => setSelectedServicioId(e.target.value)}
                    className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} - ${s.precio?.toString()} ({s.duracion} min)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-amber-200/50">
                    Actual: <span className="font-semibold text-white">{turno.servicio.nombre}</span>
                  </p>
                </div>

                {/* Cambiar Barbero */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-amber-500 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Barbero
                  </label>
                  <select
                    name="barberoId"
                    value={selectedBarberoId}
                    onChange={(e) => setSelectedBarberoId(e.target.value)}
                    className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    {barberos.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-amber-200/50">
                    Actual: <span className="font-semibold text-white">{turno.barbero.nombre}</span>
                  </p>
                </div>

                {/* Fecha y Hora Actual */}
                <div className="bg-black/60 border border-amber-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-amber-200/50">Fecha y Hora Actual</p>
                      <p className="font-semibold text-white">
                        {new Date(turno.horarioReservado).toLocaleDateString("es-AR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-amber-200/70">
                        {new Date(turno.horarioReservado).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cambiar Fecha y Hora */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Nueva Fecha y Hora
                  </label>
                  <SeleccionadorHorario
                    name="horarioReservado"
                    servicioId={selectedServicioId}
                    barberoId={selectedBarberoId}
                    turnoIdAExcluir={turno.id}
                    defaultValue={turno.horarioReservado.toISOString()}
                  />
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-amber-500">
                    Estado del Turno
                  </label>
                  <select
                    name="estado"
                    defaultValue={turno.estado}
                    className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="PENDIENTE">🟠 Pendiente</option>
                    <option value="CONFIRMADO">🟢 Confirmado</option>
                    <option value="COMPLETADO">🔵 Completado</option>
                    <option value="CANCELADO">🔴 Cancelado</option>
                  </select>
                  <p className="text-xs text-amber-200/50">
                    Estado actual: <span className="font-semibold text-white">{turno.estado}</span>
                  </p>
                </div>

                {/* Precios (Información) */}
                <div className="bg-black/60 border border-amber-900/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-200/50">Precio Total</p>
                      <p className="font-bold text-amber-500 text-lg">
                        ${turno.precioCongelado}
                      </p>
                    </div>
                    {turno.seniaCongelada > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-amber-200/50">Seña</p>
                        <p className="font-semibold text-green-500">
                          ${turno.seniaCongelada}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-amber-200/50 mt-2">
                    ℹ️ Los precios son congelados al momento de la reserva
                  </p>
                </div>

                {state.error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{state.error}</p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-amber-900/30">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 border border-amber-900/30 text-amber-200/70 rounded-lg hover:bg-black/60 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}