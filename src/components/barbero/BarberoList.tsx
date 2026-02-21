"use client";

import { deleteBarbero } from "@/actions/barbero.actions";
import { useActionState } from "react";
import { useState } from "react";
import EditBarberoModal from "./EditBarberoModal";
import { Scissors, Clock, User, Calendar } from "lucide-react";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

type Barbero = {
    id: string;
    nombre: string | null;
    srcImage: string | null;
    estado: boolean;
    createdAt: Date;
    servicios?: {
        servicio: {
            id: string;
            nombre: string;
        };
    }[];
    horarios?: {
        margenLaboral: {
            desde: string;
            hasta: string;
        };
        dia: {
            dia: number;
        };
    }[];
};

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function BarberoList({ barberos }: { barberos: Barbero[] }) {
    if (barberos.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No hay barberos disponibles</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barberos.map((barbero) => (
                <BarberoCard key={barbero.id} barbero={barbero} />
            ))}
        </div>
    );
}

function BarberoCard({ barbero }: { barbero: Barbero }) {
    const [state, formAction] = useActionState(deleteBarbero, initialState);
    const [showEditModal, setShowEditModal] = useState(false);

    const isValidImageUrl = (url: string | null): boolean => {
        if (!url) return false;
        if (url.startsWith('http://') || url.startsWith('https://')) return true;
        if (url.startsWith('/')) return true;
        return false;
    };

    const hasValidImage = isValidImageUrl(barbero.srcImage);
    const serviciosCount = barbero.servicios?.length || 0;
    const horariosCount = barbero.horarios?.length || 0;

    // Agrupar horarios por día
    const horariosPorDia = barbero.horarios?.reduce((acc, h) => {
        const dia = h.dia.dia;
        if (!acc[dia]) {
            acc[dia] = [];
        }
        acc[dia].push(h.margenLaboral);
        return acc;
    }, {} as Record<number, { desde: string; hasta: string }[]>) || {};

    const diasConHorarios = Object.keys(horariosPorDia).map(Number).sort((a, b) => a - b);

    return (
        <>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Imagen */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {hasValidImage ? (
                        <img
                            src={barbero.srcImage!}
                            alt={barbero.nombre || "Barbero"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <User className="mx-auto h-16 w-16 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">Sin imagen</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 space-y-3">
                    {/* Nombre y Estado */}
                    <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 flex-1">
                            {barbero.nombre || "Sin nombre"}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                            barbero.estado 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                        }`}>
                            {barbero.estado ? "Activo" : "Inactivo"}
                        </span>
                    </div>

                    {/* Servicios */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Scissors className="h-4 w-4 text-blue-600" />
                            <span>Servicios ({serviciosCount})</span>
                        </div>
                        
                        {barbero.servicios && barbero.servicios.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {barbero.servicios.slice(0, 4).map((s, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                                    >
                                        {s.servicio.nombre}
                                    </span>
                                ))}
                                {barbero.servicios.length > 4 && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        +{barbero.servicios.length - 4} más
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic ml-6">
                                Sin servicios asignados
                            </p>
                        )}
                    </div>

                    {/* Horarios por Día */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span>Horarios ({horariosCount})</span>
                        </div>
                        
                        {diasConHorarios.length > 0 ? (
                            <div className="space-y-1.5 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
                                {diasConHorarios.slice(0, 4).map((dia) => (
                                    <div key={dia} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                                {DIAS_SEMANA[dia]}
                                            </span>
                                        </div>
                                        <div className="ml-2 space-y-0.5">
                                            {horariosPorDia[dia].map((h, idx) => (
                                                <div
                                                    key={idx}
                                                    className="text-xs text-gray-600 flex items-center gap-1"
                                                >
                                                    <Clock className="h-3 w-3 text-green-600" />
                                                    <span className="font-mono">
                                                        {h.desde} - {h.hasta}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {diasConHorarios.length > 4 && (
                                    <p className="text-xs text-gray-500 text-center pt-1 border-t border-gray-100">
                                        +{diasConHorarios.length - 4} días más
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic ml-6">
                                Sin horarios asignados
                            </p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Editar
                        </button>
                        
                        <form action={formAction}>
                            <input type="hidden" name="id" value={barbero.id} />
                            <button
                                type="submit"
                                onClick={(e) => {
                                    if (!confirm('¿Estás seguro de dar de baja este barbero?')) {
                                        e.preventDefault();
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Dar de baja
                            </button>
                        </form>
                    </div>

                    {/* Mensajes */}
                    {state.error && (
                        <p className="text-red-600 text-xs mt-2">{state.error}</p>
                    )}
                    {state.success && (
                        <p className="text-green-600 text-xs mt-2">
                            ✅ Barbero dado de baja
                        </p>
                    )}
                </div>
            </div>

            {showEditModal && (
                <EditBarberoModal
                    barbero={barbero}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}