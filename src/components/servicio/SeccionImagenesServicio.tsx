"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import SelectorImagenConRecorte from "@/components/ui/imagenes/SelectorImagenConRecorte";
import type { SlotImagenServicio } from "@/hooks/useImagenesServicio";

type SeccionImagenesServicioProps = {
  imagenes: SlotImagenServicio[];
  puedeAgregar: boolean;
  error: string | null;
  isPending: boolean;
  onAgregar: (archivo: File) => void;
  onRemover: (id: string) => void;
  onReemplazar: (id: string, archivo: File) => void;
};

export default function SeccionImagenesServicio({
  imagenes,
  puedeAgregar,
  error,
  isPending,
  onAgregar,
  onRemover,
  onReemplazar,
}: SeccionImagenesServicioProps) {
  const total = imagenes.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)]">
          Imágenes del Servicio
        </label>
        <span className="text-xs font-medium text-[var(--admin-texto-muted)]">
          {total}/3
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {imagenes.map((slot) => (
          <div key={slot.id} className="relative">
            <SelectorImagenConRecorte
              alConfirmar={(archivo) => onReemplazar(slot.id, archivo)}
              proporcion={1}
              deshabilitado={isPending}
            >
              <div
                className="relative h-28 w-full cursor-pointer overflow-hidden rounded-lg border transition hover:opacity-80"
                style={{ borderColor: "var(--admin-border)" }}
              >
                <Image
                  src={slot.preview}
                  alt="Imagen del servicio"
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>
            </SelectorImagenConRecorte>

            <button
              type="button"
              onClick={() => onRemover(slot.id)}
              disabled={isPending}
              aria-label="Eliminar imagen"
              className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {puedeAgregar && (
          <SelectorImagenConRecorte
            alConfirmar={onAgregar}
            proporcion={1}
            deshabilitado={isPending}
            className={`relative flex h-28 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-2 transition ${
              isPending ? "pointer-events-none opacity-50" : "cursor-pointer hover:opacity-80"
            }`}
          >
            {isPending ? (
              <span className="text-sm" style={{ color: "var(--page-primary-tinta)" }}>
                Subiendo...
              </span>
            ) : (
              <>
                <Upload className="h-6 w-6" style={{ color: "var(--page-primary-tinta)" }} />
                <span className="text-center text-xs text-[var(--admin-texto-muted)]">
                  Agregar imagen
                </span>
              </>
            )}
          </SelectorImagenConRecorte>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-xs text-[var(--admin-texto-muted)]">
        Podés subir hasta 3 imágenes. Hacé clic sobre una para reemplazarla.
      </p>
    </div>
  );
}
