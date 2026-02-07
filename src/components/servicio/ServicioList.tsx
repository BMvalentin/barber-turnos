"use client";

import { deleteservicio } from "@/actions/servicio-actions";
import { useActionState } from "react";
import { useState } from "react";
import EditServicioModal from "./EditServicioModal";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

type Servicio = {
    id: string;
    nombre: string;
    descripcion: string | null;
    srcImage: string | null;
    estado: boolean;
    duracion: number;
    precio: number;
    descuento: number;
    senia: number;
    createdAt: Date;
    barberos?: {
        barbero: {
            id: string;
            nombre: string;
        };
    }[];
};

type Barbero = {
    id: string;
    nombre: string | null;
    srcImage: string | null;
    estado: boolean;
};

export default function ServicioList({ 
    servicios, 
    barberos 
}: { 
    servicios: Servicio[];
    barberos: Barbero[];
}) {
    if (servicios.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No hay servicios disponibles</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {servicios.map((servicio) => (
                <ServicioCard 
                    key={servicio.id} 
                    servicio={servicio}
                    barberos={barberos}
                />
            ))}
        </div>
    );
}

function ServicioCard({ 
    servicio, 
    barberos 
}: { 
    servicio: Servicio;
    barberos: Barbero[];
}) {
    const [state, formAction] = useActionState(deleteservicio, initialState);
    const [showEditModal, setShowEditModal] = useState(false);

    const isValidImageUrl = (url: string | null): boolean => {
        if (!url) return false;
        if (url.startsWith('http://') || url.startsWith('https://')) return true;
        if (url.startsWith('/')) return true;
        return false;
    };

    const hasValidImage = isValidImageUrl(servicio.srcImage);
    const barberosCount = servicio.barberos?.length || 0;

    return (
        <>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                    {hasValidImage ? (
                        <img
                            src={servicio.srcImage!}
                            alt={servicio.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">Sin imagen</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                        {servicio.nombre}
                    </h3>
                    
                    {servicio.descripcion && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {servicio.descripcion}
                        </p>
                    )}

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Duración:</span>
                            <span className="font-medium">{servicio.duracion} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Precio:</span>
                            <span className="font-medium text-green-600">
                                ${servicio.precio.toLocaleString()}
                            </span>
                        </div>
                        {servicio.descuento > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Descuento:</span>
                                <span className="font-medium text-orange-600">
                                    ${servicio.descuento.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {servicio.senia > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Seña:</span>
                                <span className="font-medium">
                                    ${servicio.senia.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b">
                        <span>
                            {barberosCount} barbero(s)
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            servicio.estado 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                        }`}>
                            {servicio.estado ? "Activo" : "Inactivo"}
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
                            <input type="hidden" name="id" value={servicio.id} />
                            <button
                                type="submit"
                                onClick={(e) => {
                                    if (!confirm('¿Estás seguro de dar de baja este servicio?')) {
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
                            ✅ Servicio dado de baja
                        </p>
                    )}
                </div>
            </div>

            {showEditModal && (
                <EditServicioModal
                    servicio={servicio}
                    barberos={barberos}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}