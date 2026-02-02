"use client";

import { createTurno, obtenerDatosParaTurno } from "@/actions/turno.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import SeleccionadorHorario from "./SeleccionadorHorario";
import { Button } from "../ui/button";

// Tipos definidos localmente para claridad
type VehiculoServicioData = {
    id: string;
    vehiculo: { nombre: string | null };
    servicio: { nombre: string | null };
    precio: number;
    duracion: number;
};

type UsuarioData = {
    id: string;
    name: string | null;
    email: string | null;
};

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

export default function CreateTurnoForm({ session }: { session: any }) {
    const [state, formAction] = useActionState(createTurno, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    
    // Estados de datos
    const [configuraciones, setConfiguraciones] = useState<VehiculoServicioData[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    
    // Estados de selección
    const [selectedConfigId, setSelectedConfigId] = useState<string>("");

    // Carga de datos iniciales
    useEffect(() => {
        let isMounted = true;
        async function load() {
            const res = await obtenerDatosParaTurno();
            if (isMounted) {
                if (res.success && res.data) {
                    setConfiguraciones(res.data.configuraciones as any);
                    setUsuarios(res.data.usuarios as any);
                }
                setLoadingData(false);
            }
        }
        load();
        return () => { isMounted = false; };
    }, []);

    // Feedback visual tras submit
    useEffect(() => {
        if (state.success) {
            alert("✅ Turno creado correctamente");
            formRef.current?.reset();
            setSelectedConfigId(""); // Reset del selector dependiente
        } else if (state.error) {
            alert(`❌ Error: ${state.error}`);
        }
    }, [state]);

    if (loadingData) return <div className="p-8 text-center text-gray-500">Cargando datos del sistema...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Turno</h2>
            
            <form ref={formRef} action={formAction} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SELECCIÓN DE USUARIO */}
                    <div className="space-y-2">
                        <label htmlFor="userId" className="text-sm font-medium text-gray-700">Cliente</label>
                        <select 
                            name="userId" 
                            id="userId" 
                            required 
                            className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            defaultValue={session.user.role === "USER" ? session.user.id : ""}
                        >
                            {session.user.role === "USER" ? (
                                <option value={session.user.id}>{session.user.name || "Usuario"}</option>
                            ) : (
                                <>
                                    <option value="">-- Seleccionar Cliente --</option>
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                    </div>

                    {/* SELECCIÓN DE SERVICIO */}
                    <div className="space-y-2">
                        <label htmlFor="vehiculoServicioId" className="text-sm font-medium text-gray-700">Servicio</label>
                        <select 
                            name="vehiculoServicioId" 
                            id="vehiculoServicioId"
                            required
                            className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setSelectedConfigId(e.target.value)}
                            value={selectedConfigId}
                        >
                            <option value="">-- Seleccionar Vehículo y Servicio --</option>
                            {configuraciones.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.vehiculo.nombre} | {c.servicio.nombre} — ${c.precio} ({c.duracion} min)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PATENTE */}
                    <div className="space-y-2">
                        <label htmlFor="patente" className="text-sm font-medium text-gray-700">Patente</label>
                        <input 
                            type="text" 
                            name="patente" 
                            id="patente"
                            required
                            maxLength={10}
                            placeholder="AA123BB"
                            className="w-full p-2.5 border rounded-lg bg-gray-50 uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* COMPONENTE DE HORARIOS (Lógica compleja aislada) */}
                <SeleccionadorHorario 
                    name="horarioReservado"
                    vehiculoServicioId={selectedConfigId}
                />

                {/* Mensajes de error del servidor */}
                {state.error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {state.error}
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
        <Button 
            type="submit" 
            disabled={pending}
            className="w-full md:w-auto md:min-w-50"
            variant={pending ? "ghost" : "celeste"}
        >
            {pending ? "Procesando..." : "Confirmar Reserva"}
        </Button>
    );
}