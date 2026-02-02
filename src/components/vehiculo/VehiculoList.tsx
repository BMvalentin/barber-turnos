"use client";

import { deleteVehiculo } from "@/actions/vehiculo-actions";
import { useActionState } from "react";
import { useState } from "react";
import EditVehiculoModal from "./EditVehiculoModal";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

type Vehiculo = {
    id: string;
    nombre: string | null;
    srcImage: string | null;
    estado: boolean;
    createdAt: Date;
    vehiculo_servicio: any[];
};

export default function VehiculoList({ vehiculos }: { vehiculos: Vehiculo[] }) {
    if (vehiculos.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No hay vehículos disponibles</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiculos.map((vehiculo) => (
                <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
            ))}
        </div>
    );
}

function VehiculoCard({ vehiculo }: { vehiculo: Vehiculo }) {
    const [state, formAction] = useActionState(deleteVehiculo, initialState);
    const [showEditModal, setShowEditModal] = useState(false);

    const isValidImageUrl = (url: string | null): boolean => {
        if (!url) return false;
        if (url.startsWith('http://') || url.startsWith('https://')) return true;
        if (url.startsWith('/')) return true;
        return false;
    };

    const hasValidImage = isValidImageUrl(vehiculo.srcImage);

    return (
        <>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {hasValidImage ? (
                        <img
                            src={vehiculo.srcImage!}
                            alt={vehiculo.nombre || "Vehículo"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">Sin imagen</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                        {vehiculo.nombre || "Sin nombre"}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>
                            {vehiculo.vehiculo_servicio.length} servicio(s)
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            vehiculo.estado 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                        }`}>
                            {vehiculo.estado ? "Activo" : "Inactivo"}
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
                            <input type="hidden" name="id" value={vehiculo.id} />
                            <button
                                type="submit"
                                onClick={(e) => {
                                    if (!confirm('¿Estás seguro de dar de baja este vehículo?')) {
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
                            ✅ Vehículo dado de baja
                        </p>
                    )}
                </div>
            </div>

            {showEditModal && (
                <EditVehiculoModal
                    vehiculo={vehiculo}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}