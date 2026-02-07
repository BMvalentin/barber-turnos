"use client";

import { createServicio } from "@/actions/servicio-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";

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
};

export default function CreateServicioForm({ barberos }: { barberos: Barbero[] }) {
    const [state, formAction] = useActionState(createServicio, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            alert("✅ Servicio creado exitosamente!");
        }
        if (state.error) {
            alert(`❌ Error: ${state.error}`);
        }
    }, [state.success, state.error]);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Crear Servicio</h2>
            
            <form ref={formRef} action={formAction} className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                        Nombre del Servicio *
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
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
                            defaultValue="30"
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
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="5000"
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
                            defaultValue="0"
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
                            defaultValue="0"
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
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://ejemplo.com/imagen.jpg o /images/foto.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Deja vacío si no tienes imagen
                    </p>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="estado"
                        name="estado"
                        value="true"
                        defaultChecked
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

                {state.success && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-600 text-sm">
                            ✅ Servicio creado correctamente
                        </p>
                    </div>
                )}

                <SubmitButton />
            </form>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? "Creando..." : "Crear Servicio"}
        </button>
    );
}