"use client";

import { actualizarVehiculoXServicio, obtenerVehiculosXServicios } from "@/actions/vehiculoXServicio-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";

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
    vehiculo: {
        id: string;
        nombre: string | null;
    };
    servicio: {
        id: string;
        nombre: string | null;
    };
};

type Vehiculo = {
    id: string;
    nombre: string | null;
};

type Servicio = {
    id: string;
    nombre: string | null;
};

type EditVehiculoXServicioModalProps = {
    item: VehiculoXServicio;
    onClose: () => void;
};

export default function EditVehiculoXServicioModal({ item, onClose }: EditVehiculoXServicioModalProps) {
    const [state, formAction] = useActionState(actualizarVehiculoXServicio, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarDatos() {
            const result = await obtenerVehiculosXServicios();
            if (result.success && result.data) {
                setVehiculos(result.data.vehiculos);
                setServicios(result.data.servicios);
            }
            setLoading(false);
        }
        cargarDatos();
    }, []);

    useEffect(() => {
        if (state.success) {
            alert("✅ Configuración actualizada exitosamente!");
            onClose();
        }
        if (state.error) {
            alert(`❌ Error: ${state.error}`);
        }
    }, [state.success, state.error, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Editar Configuración</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-gray-500">Cargando...</p>
                    ) : (
                        <form ref={formRef} action={formAction} className="space-y-4">
                            <input type="hidden" name="id" value={item.id} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="id_vehiculo" className="block text-sm font-medium mb-1">
                                        Tipo de Vehículo *
                                    </label>
                                    <select
                                        id="id_vehiculo"
                                        name="id_vehiculo"
                                        required
                                        defaultValue={item.vehiculoId}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Seleccione un vehículo</option>
                                        {vehiculos.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="id_servicio" className="block text-sm font-medium mb-1">
                                        Servicio *
                                    </label>
                                    <select
                                        id="id_servicio"
                                        name="id_servicio"
                                        required
                                        defaultValue={item.servicioId}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Seleccione un servicio</option>
                                        {servicios.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="duracionMinutos" className="block text-sm font-medium mb-1">
                                        Duración (minutos) *
                                    </label>
                                    <input
                                        type="number"
                                        id="duracionMinutos"
                                        name="duracionMinutos"
                                        required
                                        min="1"
                                        defaultValue={item.duracion}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="precio" className="block text-sm font-medium mb-1">
                                        Precio *
                                    </label>
                                    <input
                                        type="number"
                                        id="precio"
                                        name="precio"
                                        required
                                        min="0"
                                        step="0.01"
                                        defaultValue={item.precio}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="descuento" className="block text-sm font-medium mb-1">
                                        Descuento
                                    </label>
                                    <input
                                        type="number"
                                        id="descuento"
                                        name="descuento"
                                        min="0"
                                        step="0.01"
                                        defaultValue={item.descuento}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="senia" className="block text-sm font-medium mb-1">
                                        Seña
                                    </label>
                                    <input
                                        type="number"
                                        id="senia"
                                        name="senia"
                                        min="0"
                                        step="0.01"
                                        defaultValue={item.senia}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {state.error && (
                                <div className="bg-red-50 border border-red-200 rounded p-3">
                                    <p className="text-red-600 text-sm">{state.error}</p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <SubmitButton />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? "Guardando..." : "Guardar Cambios"}
        </button>
    );
}