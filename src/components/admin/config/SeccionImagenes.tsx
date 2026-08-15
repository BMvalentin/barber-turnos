// components/admin/config/SeccionImagenes.tsx
import { Image as ImageIcon } from "lucide-react";
import CampoImagen from "@/components/admin/config/CampoImagen";
import type { NombreCampoImagen, ManejarCambio, ManejarArchivo } from "@/components/admin/config/tipos";

interface SeccionImagenesProps {
  logo: string;
  favicon: string;
  fondo: string;
  campoSubiendo: NombreCampoImagen | null;
  manejarArchivo: ManejarArchivo;
  manejarTexto: ManejarCambio;
  quitarImagen: (campo: NombreCampoImagen) => void;
}

export default function SeccionImagenes({
  logo,
  favicon,
  fondo,
  campoSubiendo,
  manejarArchivo,
  manejarTexto,
  quitarImagen,
}: SeccionImagenesProps) {
  return (
    <div>
      <div className="border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-[var(--admin-texto-muted)]" />
          <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-texto-primario)]">
            Imágenes
          </h2>
        </div>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Logo, favicon e imagen de fondo del sitio.
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <CampoImagen
          etiqueta="Logo del Negocio (icono de la web)"
          campo="logo"
          valor={logo}
          pista="Se muestra en el encabezado y el pie de página."
          claseVistaPrevia="h-10 object-contain"
          subiendo={campoSubiendo === "logo"}
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
          manejarArchivo={manejarArchivo}
          manejarTexto={manejarTexto}
          quitarImagen={quitarImagen}
        />

        <CampoImagen
          etiqueta="Imagen de fondo (Home)"
          campo="backgroundImage"
          valor={fondo}
          pista="Se muestra atenuada detrás de la portada. Recomendado 1920×1080."
          claseVistaPrevia="h-24 w-full object-cover"
          subiendo={campoSubiendo === "backgroundImage"}
          manejarArchivo={manejarArchivo}
          manejarTexto={manejarTexto}
          quitarImagen={quitarImagen}
        />
      </div>
    </div>
  );
}
