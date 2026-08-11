// components/admin/config/CampoColor.tsx
import type { ManejarCambio } from "@/components/admin/config/tipos";

interface CampoColorProps {
    nombre: string;
    etiqueta: string;
    valor: string;
    borde: React.CSSProperties;
    manejarCambio: ManejarCambio;
}

export default function CampoColor({ nombre, etiqueta, valor, borde, manejarCambio }: CampoColorProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{etiqueta}</label>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    name={nombre}
                    value={valor}
                    onChange={manejarCambio}
                    className="w-12 h-10 bg-transparent rounded cursor-pointer"
                />
                <input
                    type="text"
                    name={nombre}
                    value={valor}
                    onChange={manejarCambio}
                    className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all font-mono"
                    style={borde}
                />
            </div>
        </div>
    );
}