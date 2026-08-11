// components/admin/config/CampoImagen.tsx
// Vive en su propio archivo: si estuviera dentro del form, React lo
// remontaría en cada render y el input de URL perdería el foco al tipear.
import type { NombreCampoImagen, ManejarCambio, ManejarArchivo } from "@/components/admin/config/tipos";

interface CampoImagenProps {
    etiqueta: string;
    campo: NombreCampoImagen;
    valor: string;
    pista?: string;
    claseVistaPrevia: string;
    subiendo: boolean;
    borde: React.CSSProperties;
    manejarArchivo: ManejarArchivo;
    manejarTexto: ManejarCambio;
    quitarImagen: (campo: NombreCampoImagen) => void;
}

export default function CampoImagen({
    etiqueta,
    campo,
    valor,
    pista,
    claseVistaPrevia,
    subiendo,
    borde,
    manejarArchivo,
    manejarTexto,
    quitarImagen,
}: CampoImagenProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{etiqueta}</label>

            <input
                type="file"
                accept="image/*"
                disabled={subiendo}
                onChange={(e) => manejarArchivo(e, campo)}
                className="w-full bg-black/60 rounded-lg p-2 text-white cursor-pointer text-sm transition-all disabled:opacity-50"
                style={borde}
            />

            <input
                type="text"
                name={campo}
                value={valor}
                onChange={manejarTexto}
                placeholder="…o pegá una URL de imagen"
                className="w-full mt-2 bg-black/60 rounded-lg p-2 text-white text-xs focus:outline-none transition-all"
                style={borde}
            />

            {pista && <p className="mt-1 text-xs text-gray-500">{pista}</p>}

            {subiendo && <p className="mt-2 text-xs text-gray-400">Subiendo…</p>}

            {valor && !subiendo && (
                <div className="mt-2 space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={valor}
                        alt={`Vista previa de ${etiqueta}`}
                        className={`${claseVistaPrevia} bg-white/10 p-1 rounded`}
                    />
                    <button
                        type="button"
                        onClick={() => quitarImagen(campo)}
                        className="block text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Quitar imagen
                    </button>
                </div>
            )}
        </div>
    );
}