// components/admin/config/CampoImagen.tsx
// Vive en su propio archivo: si estuviera dentro del form, React lo
// remontaría en cada render y el input de URL perdería el foco al tipear.
import type { NombreCampoImagen, ManejarCambio, ManejarArchivo } from "@/components/admin/config/tipos";
import SelectorImagenConRecorte from "@/components/ui/imagenes/SelectorImagenConRecorte";
import { LIMITE_IMAGEN_CONFIGURACION_BYTES } from "@/lib/imagenes/limites-imagen-configuracion";

const CLASES_ARCHIVO =
  "w-full cursor-pointer rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2 text-sm text-[var(--admin-texto-secundario)] transition-colors duration-150 hover:border-[var(--admin-border-fuerte)] disabled:opacity-50 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-white/10 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-[var(--admin-texto-primario)]";

const CLASES_URL =
  "mt-2 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2 text-xs text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] transition-colors duration-150 hover:border-[var(--admin-border-fuerte)] focus:border-[var(--page-primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]";

interface CampoImagenProps {
  etiqueta: string;
  campo: NombreCampoImagen;
  valor: string;
  pista?: string;
  claseVistaPrevia: string;
  proporcionRecorte?: number | "libre";
  subiendo: boolean;
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
  proporcionRecorte = "libre",
  subiendo,
  manejarArchivo,
  manejarTexto,
  quitarImagen,
}: CampoImagenProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
        {etiqueta}
      </label>

      <SelectorImagenConRecorte
        alConfirmar={(archivo) => manejarArchivo(archivo, campo)}
        proporcion={proporcionRecorte}
        deshabilitado={subiendo}
        tamanoMaximoBytes={LIMITE_IMAGEN_CONFIGURACION_BYTES}
        className={CLASES_ARCHIVO}
      >
        Seleccionar imagen
      </SelectorImagenConRecorte>

      <input
        type="text"
        name={campo}
        value={valor}
        onChange={manejarTexto}
        placeholder="…o pegá una URL de imagen"
        className={CLASES_URL}
      />

      {pista && <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">{pista}</p>}

      {subiendo && <p className="mt-2 text-xs text-[var(--admin-texto-muted)]">Subiendo…</p>}

      {valor && !subiendo && (
        <div className="mt-2 space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={valor}
            alt={`Vista previa de ${etiqueta}`}
            className={`${claseVistaPrevia} rounded bg-white/10 p-1`}
          />
          <button
            type="button"
            onClick={() => quitarImagen(campo)}
            className="block text-xs text-red-400 transition-colors hover:text-red-300"
          >
            Quitar imagen
          </button>
        </div>
      )}
    </div>
  );
}
