// components/admin/config/SeccionImagenes.tsx
import { Image as ImageIcon } from "lucide-react";
import CampoImagen from "@/components/admin/config/CampoImagen";
import EncabezadoSeccion from "@/components/admin/config/EncabezadoSeccion";
import type { NombreCampoImagen, ManejarCambio, ManejarArchivo } from "@/components/admin/config/tipos";

interface SeccionImagenesProps {
    logo: string;
    favicon: string;
    fondo: string;
    campoSubiendo: NombreCampoImagen | null;
    borde: React.CSSProperties;
    manejarArchivo: ManejarArchivo;
    manejarTexto: ManejarCambio;
    quitarImagen: (campo: NombreCampoImagen) => void;
    colorIcono: string;
}

export default function SeccionImagenes({
    logo,
    favicon,
    fondo,
    campoSubiendo,
    borde,
    manejarArchivo,
    manejarTexto,
    quitarImagen,
    colorIcono,
}: SeccionImagenesProps) {
    return (
        <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
            <EncabezadoSeccion
                icono={<ImageIcon className="w-5 h-5" style={{ color: colorIcono }} />}
                titulo="Imágenes y Multimedia"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CampoImagen
                    etiqueta="Logo del Negocio (icono de la web)"
                    campo="logo"
                    valor={logo}
                    pista="Se muestra en el encabezado y el pie de página."
                    claseVistaPrevia="h-10 object-contain"
                    subiendo={campoSubiendo === "logo"}
                    borde={borde}
                    manejarArchivo={manejarArchivo}
                    manejarTexto={manejarTexto}
                    quitarImagen={quitarImagen}
                />

                <CampoImagen
                    etiqueta="Favicon"
                    campo="favicon"
                    valor={favicon}
                    pista="Icono de la pestaña del navegador. Cuadrado, ideal 512×512."
                    claseVistaPrevia="h-6 w-6 object-contain"
                    subiendo={campoSubiendo === "favicon"}
                    borde={borde}
                    manejarArchivo={manejarArchivo}
                    manejarTexto={manejarTexto}
                    quitarImagen={quitarImagen}
                />
            </div>

            <div className="pt-2">
                <CampoImagen
                    etiqueta="Imagen de fondo (Home)"
                    campo="backgroundImage"
                    valor={fondo}
                    pista="Se muestra atenuada detrás de la portada. Recomendado 1920×1080."
                    claseVistaPrevia="h-24 w-full object-cover"
                    subiendo={campoSubiendo === "backgroundImage"}
                    borde={borde}
                    manejarArchivo={manejarArchivo}
                    manejarTexto={manejarTexto}
                    quitarImagen={quitarImagen}
                />
            </div>
        </div>
    );
}