// components/admin/config/SeccionIdentidad.tsx
import { Building2 } from "lucide-react";
import EncabezadoSeccion from "@/components/admin/config/EncabezadoSeccion";
import type { ManejarCambio } from "@/components/admin/config/tipos";

interface SeccionIdentidadProps {
    nombre: string;
    slogan: string;
    descripcion: string;
    borde: React.CSSProperties;
    manejarCambio: ManejarCambio;
    colorIcono: string;
}

export default function SeccionIdentidad({
    nombre,
    slogan,
    descripcion,
    borde,
    manejarCambio,
    colorIcono,
}: SeccionIdentidadProps) {
    return (
        <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
            <EncabezadoSeccion
                icono={<Building2 className="w-5 h-5" style={{ color: colorIcono }} />}
                titulo="Información General"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Negocio</label>
                    <input
                        type="text"
                        name="name"
                        value={nombre}
                        onChange={manejarCambio}
                        className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                        style={borde}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Slogan</label>
                    <input
                        type="text"
                        name="slogan"
                        value={slogan}
                        onChange={manejarCambio}
                        className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                        style={borde}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <textarea
                    name="description"
                    rows={3}
                    value={descripcion}
                    onChange={manejarCambio}
                    className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                    style={borde}
                />
            </div>
        </div>
    );
}