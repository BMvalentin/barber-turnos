"use client";

import { Upload, X } from "lucide-react";

type SeccionImagenServicioProps = {
  previewUrl: string | null;
  srcImage: string;
  uploadError: string | null;
  isPending: boolean;
  onFileChange: (archivo: File) => void;
  onRemove: () => void;
  variante?: "servicio" | "barbero";
};

export default function SeccionImagenServicio({
  previewUrl,
  srcImage,
  uploadError,
  isPending,
  onFileChange,
  onRemove,
  variante = "servicio",
}: SeccionImagenServicioProps) {
  const esBarbero = variante === "barbero";

  return (
    <div className="space-y-2">
      {esBarbero ? (
        <label className="text-sm font-semibold" style={{ color: "var(--page-primary-tinta)" }}>
          Foto del barbero <span className="text-zinc-500 text-xs">(Opcional)</span>
        </label>
      ) : (
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)]">
          Imagen del Servicio
        </label>
      )}

      {previewUrl || srcImage ? (
        <div className="relative w-fit">
          <img
            src={previewUrl || srcImage}
            alt="Vista previa"
            className="h-32 w-32 object-cover rounded-lg border"
            style={{ borderColor: esBarbero ? "var(--page-primary-80)" : "var(--page-secondary)" }}
          />

          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
            isPending ? "opacity-50 pointer-events-none" : ""
          }`}
          style={{ borderColor: esBarbero ? "var(--page-primary-50)" : "var(--page-secondary)" }}
        >
          {isPending ? (
            <span className="text-sm" style={{ color: "var(--page-primary-tinta)" }}>
              Subiendo...
            </span>
          ) : (
            <>
              <Upload className="h-6 w-6" style={{ color: "var(--page-primary-tinta)" }} />
              <span className={`text-sm ${esBarbero ? "text-zinc-300" : "text-[var(--admin-texto-muted)]"}`}>
                Hacé clic para subir una imagen
              </span>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) onFileChange(archivo);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isPending}
          />
        </label>
      )}

      {uploadError && (
        <p className={`text-sm ${esBarbero ? "text-red-400" : "text-red-500"}`}>
          {uploadError}
        </p>
      )}
    </div>
  );
}
