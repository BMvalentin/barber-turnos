"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import SelectorImagenConRecorte from "@/components/ui/imagenes/SelectorImagenConRecorte";

type SeccionImagenServicioProps = {
  previewUrl: string | null;
  srcImage: string;
  uploadError: string | null;
  isPending: boolean;
  onFileChange: (archivo: File) => void;
  onRemove: () => void;
  variante?: "servicio" | "barbero";
  tituloBarbero?: string;
};

export default function SeccionImagenServicio({
  previewUrl,
  srcImage,
  uploadError,
  isPending,
  onFileChange,
  onRemove,
  variante = "servicio",
  tituloBarbero,
}: SeccionImagenServicioProps) {
  const esBarbero = variante === "barbero";

  return (
    <div className="space-y-2">
      {esBarbero ? (
        <label className="text-sm font-medium text-[var(--admin-texto-primario)]">
          {tituloBarbero ?? "Foto del barbero"} <span className="text-[var(--admin-texto-muted)] text-xs">(Requerida para aparecer en reservas)</span>
        </label>
      ) : (
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)]">
          Imagen del Servicio
        </label>
      )}

      {previewUrl || srcImage ? (
        <div className={esBarbero ? "flex items-center gap-4" : "relative w-fit"}>
          <Image
            src={previewUrl || srcImage}
            alt="Vista previa"
            width={esBarbero ? 80 : 128}
            height={esBarbero ? 80 : 128}
            className={esBarbero ? "h-20 w-20 rounded-full border object-cover" : "h-32 w-32 object-cover rounded-lg border"}
            style={{ borderColor: esBarbero ? "var(--admin-border-fuerte)" : "var(--admin-border)" }}
          />

          {esBarbero ? <button type="button" onClick={onRemove} className="admin-control text-[var(--admin-error)]">Eliminar foto</button> : <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700"><X className="h-4 w-4" /></button>}
        </div>
      ) : (
        <SelectorImagenConRecorte
          alConfirmar={onFileChange}
          proporcion={1}
          deshabilitado={isPending}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--admin-border-fuerte)] p-4 transition ${
            isPending ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {isPending ? (
            <span className="text-sm" style={{ color: "var(--page-primary-tinta)" }}>
              Subiendo...
            </span>
          ) : (
            <>
              <Upload className="h-6 w-6" style={{ color: "var(--page-primary-tinta)" }} />
              <span className="text-sm text-[var(--admin-texto-muted)]">
                Seleccionar foto
              </span>
            </>
          )}

        </SelectorImagenConRecorte>
      )}

      {uploadError && (
        <p role="alert" className="text-sm text-[var(--admin-error)]">
          {uploadError}
        </p>
      )}
    </div>
  );
}
