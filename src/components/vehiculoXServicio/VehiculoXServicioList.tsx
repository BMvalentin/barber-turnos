"use client";

import { deleteVehiculoXServicio } from "@/actions/vehiculoXServicio-actions";
import { useActionState } from "react";
import { useState } from "react";
import EditVehiculoXServicioModal from "./EditVehiculoXServicioModal";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

type VehiculoXServicio = {
    id: string;
    vehiculoId: string;
    servicioId: string;
    duracion: number;
    precio: number;
    descuento: number;
    senia: number;
    estado: boolean;
    createdAt: Date;
    vehiculo: {
        id: string;
        nombre: string | null;
        srcImage: string | null;
    };
    servicio: {
        id: string;
        nombre: string | null;
        srcImage: string | null;
    };
};

export default function VehiculoXServicioList({ items }: { items: VehiculoXServicio[] }) {
    // Validar que items sea un array
    if (!Array.isArray(items)) {
        console.error("VehiculoXServicioList: items no es un array", items);
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">Error: datos inválidos</p>
                <pre className="text-xs mt-2">{JSON.stringify(items, null, 2)}</pre>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No hay configuraciones disponibles</p>
                <p className="text-sm text-gray-500 mt-2">
                    Crea una nueva configuración para vincular un vehículo con un servicio
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <VehiculoXServicioCard key={item.id} item={item} />
            ))}
        </div>
    );
}

function VehiculoXServicioCard({ item }: { item: VehiculoXServicio }) {
    const [state, formAction] = useActionState(deleteVehiculoXServicio, initialState);
    const [showEditModal, setShowEditModal] = useState(false);

    const formatPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(precio);
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Header con nombres */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <h3 className="font-semibold text-lg mb-1">
                        {item.vehiculo.nombre}
                    </h3>
                    <p className="text-blue-100 text-sm">
                        {item.servicio.nombre}
                    </p>
                </div>

                {/* Contenido */}
                <div className="p-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Duración:</span>
                            <span className="font-semibold">{item.duracion} min</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Precio:</span>
                            <span className="font-semibold text-green-600">
                                {formatPrecio(item.precio)}
                            </span>
                        </div>

                        {item.descuento > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Descuento:</span>
                                <span className="font-semibold text-orange-600">
                                    {formatPrecio(item.descuento)}
                                </span>
                            </div>
                        )}

                        {item.senia > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Seña:</span>
                                <span className="font-semibold text-blue-600">
                                    {formatPrecio(item.senia)}
                                </span>
                            </div>
                        )}

                        {/* Precio final si hay descuento */}
                        {item.descuento > 0 && (
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-sm font-medium text-gray-700">Precio Final:</span>
                                <span className="font-bold text-lg text-green-700">
                                    {formatPrecio(item.precio - item.descuento)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Editar
                        </button>
                        
                        <form action={formAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                                type="submit"
                                onClick={(e) => {
                                    if (!confirm('¿Estás seguro de dar de baja esta configuración?')) {
                                        e.preventDefault();
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Eliminar
                            </button>
                        </form>
                    </div>

                    {state.error && (
                        <p className="text-red-600 text-xs mt-2">{state.error}</p>
                    )}
                    {state.success && (
                        <p className="text-green-600 text-xs mt-2">
                            ✅ Configuración eliminada
                        </p>
                    )}
                </div>
            </div>

            {showEditModal && (
                <EditVehiculoXServicioModal
                    item={item}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}