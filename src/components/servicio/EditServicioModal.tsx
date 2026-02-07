"use client";

import { actualizarServicio } from "@/actions/servicio-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";

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
};

type Barbero = {
    id: string;
    nombre: string | null;
    srcImage: string | null;
    estado: boolean;
};

type EditServicioModalProps = {
    servicio: Servicio;
    barberos: Barbero[];
    onClose: () => void;
};

export default function EditServicioModal({ servicio, barberos, onClose }: EditServicioModalProps) {
    const [state, formAction] = useActionState(actualizarServicio, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            alert("✅ Servicio actualizado exitosamente!");
            onClose();
        }
        if (state.error) {
            alert(`❌ Error: ${state.error}`);
        }
    }, [state.success, state.error, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Editar Servicio</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form ref={formRef} action={formAction} className="space-y-4">
                        <input type="hidden" name="id" value={servicio.id} />

                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                                Nombre del Servicio *
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                required
                                defaultValue={servicio.nombre}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Corte Clásico"
                            />
                        </div>

                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
                                Descripción
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                rows={3}
                                defaultValue={servicio.descripcion || ""}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Descripción del servicio"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="duracion" className="block text-sm font-medium mb-1">
                                    Duración (min) *
                                </label>
                                <input
                                    type="number"
                                    id="duracion"
                                    name="duracion"
                                    required
                                    min="1"
                                    defaultValue={servicio.duracion}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="precio" className="block text-sm font-medium mb-1">
                                    Precio ($) *
                                </label>
                                <input
                                    type="number"
                                    id="precio"
                                    name="precio"
                                    required
                                    min="0"
                                    step="0.01"
                                    defaultValue={servicio.precio}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="descuento" className="block text-sm font-medium mb-1">
                                    Descuento ($)
                                </label>
                                <input
                                    type="number"
                                    id="descuento"
                                    name="descuento"
                                    min="0"
                                    step="0.01"
                                    defaultValue={servicio.descuento}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="senia" className="block text-sm font-medium mb-1">
                                    Seña ($)
                                </label>
                                <input
                                    type="number"
                                    id="senia"
                                    name="senia"
                                    min="0"
                                    step="0.01"
                                    defaultValue={servicio.senia}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="srcImage" className="block text-sm font-medium mb-1">
                                URL de Imagen
                            </label>
                            <input
                                type="text"
                                id="srcImage"
                                name="srcImage"
                                defaultValue={servicio.srcImage || ""}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/images/servicio.jpg o https://..."
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="estado"
                                name="estado"
                                value="true"
                                defaultChecked={servicio.estado}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="estado" className="ml-2 text-sm font-medium">
                                Servicio activo
                            </label>
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