"use client";

import { deleteTurno, completedTurno } from "@/actions/turno.actions";
import { useActionState } from "react";
import { useState } from "react";
import EditTurnoModal from "./EditarTurnoModal";
import { Button } from "../ui/button";

const initialState = {
    success: false,
    error: undefined,
    data: undefined
};
const initialStateComplete = {
    success: false,
    error: undefined,
    data: undefined
};

type Turno = {
    id: string;
    horarioReservado: Date;
    patente: string;
    precioCongelado: number;
    seniaCongelada: number;
    estado: number;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    vehiculo_servicio: {
        id: string;
        vehiculo: {
            id: string;
            nombre: string | null;
        };
        servicio: {
            id: string;
            nombre: string | null;
        };
        duracion: number;
    };
};

export default function TurnoList({ session, turnos }: { session: any; turnos: Turno[] }) {
    if (!Array.isArray(turnos)) {
        console.error("TurnoList: turnos no es un array", turnos);
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">Error: datos inválidos</p>
            </div>
        );
    }

    if (turnos.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No hay turnos reservados</p>
                <p className="text-sm text-gray-500 mt-2">
                    Crea un nuevo turno para comenzar
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turnos.map((turno) => (
                <TurnoCard session={session} key={turno.id} turno={turno} />
            ))}
        </div>
    );
}

function TurnoCard({session, turno }: { session: any; turno: Turno }) {
    const [state, formAction] = useActionState(deleteTurno, initialState);
    const [stateComplete, formActionComplete] = useActionState(completedTurno, initialStateComplete);
    const [showEditModal, setShowEditModal] = useState(false);

    const formatFecha = (fecha: Date) => {
        return new Date(fecha).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(precio);
    };

    // Determinar si el turno es pasado, hoy o futuro
    const fechaTurno = new Date(turno.horarioReservado);
    const hoy = new Date();
    const isPasado = fechaTurno < hoy;
    const isHoy = fechaTurno.toDateString() === hoy.toDateString();

    return (
        <>
            <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${
                isPasado ? 'opacity-75' : ''
            }`}>
                {/* Header */}
                <div className={`p-4 text-white ${
                    isPasado ? 'bg-gray-500' : isHoy ? 'bg-green-700' : 'bg-[#6fa9da]'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">
                                {isPasado ? '🕐 Pasado' : isHoy ? '📅 Hoy' : '📅 Próximo'}
                            </p>
                            <p className="font-bold text-lg">{formatFecha(fechaTurno)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Patente</p>
                            <p className="font-bold text-xl">{turno.patente}</p>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-3">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Cliente</p>
                        <p className="font-semibold text-gray-800">{turno.user.name}</p>
                        {turno.user.email && (
                            <p className="text-sm text-gray-600">{turno.user.email}</p>
                        )}
                    </div>

                    <div className="border-t pt-3">
                        <p className="text-xs text-gray-500 uppercase">Servicio</p>
                        <p className="font-semibold text-gray-800">
                            {turno.vehiculo_servicio.vehiculo.nombre} - {turno.vehiculo_servicio.servicio.nombre}
                        </p>
                        <p className="text-sm text-gray-600">
                            Duración: {turno.vehiculo_servicio.duracion} min
                        </p>
                    </div>

                    <div className="border-t pt-3 grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-xs text-gray-500">Precio</p>
                            <p className="font-bold text-green-600">
                                {formatPrecio(turno.precioCongelado)}
                            </p>
                        </div>
                        {turno.seniaCongelada > 0 && (
                            <div>
                                <p className="text-xs text-gray-500">Seña</p>
                                <p className="font-bold text-blue-600">
                                    {formatPrecio(turno.seniaCongelada)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-3">
                        {session?.user.role === "ADMIN" &&
                        <form className="w-full flex flex-wrap" action={formActionComplete}>
                            <input type="hidden" name="id" value={turno.id} />
                        <Button
                            onClick={(e) => {
                                    if (!confirm('¿Estás seguro de completar este turno?')) {
                                        e.preventDefault();
                                    }
                                }}
                            type="submit"
                            variant={isPasado ? "verde" : "celeste"}
                            className="flex-1 py-2 rounded text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isPasado ? "Completado" : "Editar"}
                        </Button></form>}
                        {session?.user.role !== "ADMIN" && <Button
                            onClick={() => setShowEditModal(true)}
                            variant={isPasado ? "ghost" : "celeste"}
                            disabled={isPasado}
                            className="flex-1 py-2 rounded text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isPasado ? "Fecha pasada por gestionar" : "Editar"}
                        </Button>}
                        
                        <form action={formAction}>
                            <input type="hidden" name="id" value={turno.id} />
                            <Button
                                type="submit"
                                variant={"rojo"}
                                onClick={(e) => {
                                    if (!confirm('¿Estás seguro de cancelar este turno?')) {
                                        e.preventDefault();
                                    }
                                }}
                                className="px-4 py-2text-sm font-medium"
                            >
                                Cancelar
                            </Button>
                        </form>
                    </div>

                    {state.error && (
                        <p className="text-red-600 text-xs mt-2">{state.error}</p>
                    )}
                    {state.success && (
                        <p className="text-green-600 text-xs mt-2">
                            ✅ Turno cancelado
                        </p>
                    )}
                    {stateComplete.error && (
                        <p className="text-red-600 text-xs mt-2">{stateComplete.error}</p>
                    )}
                    {stateComplete.success && (
                        <p className="text-green-600 text-xs mt-2">
                            ✅ Turno completado
                        </p>
                    )}
                </div>
            </div>

            {showEditModal && (
                <EditTurnoModal
                    session={session}
                    turno={turno}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}