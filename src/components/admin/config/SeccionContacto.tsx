// components/admin/config/SeccionContacto.tsx
import { MapPin } from "lucide-react";
import EncabezadoSeccion from "@/components/admin/config/EncabezadoSeccion";
import type { ManejarCambio } from "@/components/admin/config/tipos";

interface SeccionContactoProps {
    whatsapp: string;
    mapsUrl: string;
    direccion: string;
    borde: React.CSSProperties;
    manejarCambio: ManejarCambio;
    colorIcono: string;
}

export default function SeccionContacto({
    whatsapp,
    mapsUrl,
    direccion,
    borde,
    manejarCambio,
    colorIcono,
}: SeccionContactoProps) {
    return (
        <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
            <EncabezadoSeccion
                icono={<MapPin className="w-5 h-5" style={{ color: colorIcono }} />}
                titulo="Ubicación y Contacto"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp de Contacto</label>
                    <input
                        type="text"
                        name="whatsapp"
                        value={whatsapp}
                        onChange={manejarCambio}
                        placeholder="Ej: 5491112345678"
                        className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                        style={borde}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">URL de Google Maps (Iframe Src)</label>
                    <input
                        type="text"
                        name="mapsUrl"
                        value={mapsUrl}
                        onChange={manejarCambio}
                        placeholder="Pegá el link del src del mapa"
                        className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                        style={borde}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Dirección del Local</label>
                    <input
                        type="text"
                        name="address"
                        value={direccion}
                        onChange={manejarCambio}
                        placeholder="Ej: Av. Montreal 695"
                        className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                        style={borde}
                    />
                </div>
            </div>
        </div>
    );
}