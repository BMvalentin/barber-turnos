"use client";

import { deleteBarbero } from "@/actions/barbero.actions";
import { useActionState } from "react";
import { useState } from "react";
import EditBarberoModal from "./EditBarberoModal";

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
};

export default function BarberoList({ barberos }: { barberos: Barbero[] }) {
    if (barberos.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
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

    return (
        <>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
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
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">Sin imagen</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                        {barbero.nombre || "Sin nombre"}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>
                            {serviciosCount} servicio(s)
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            barbero.estado 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                        }`}>
                            {barbero.estado ? "Activo" : "Inactivo"}
                        </span>
                    </div>

                    <div className="flex gap-2">
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