"use client";

import { Upload, X } from "lucide-react";

type Props = {
  imagen: string | null;
  subiendo: boolean;
  errorSubida: string | null;
  onSeleccionarArchivo: (archivo: File) => void;
  onQuitarImagen: () => void;
};

export default function SelectorImagenBarbero({
  imagen,
  subiendo,
  errorSubida,
  onSeleccionarArchivo,
  onQuitarImagen,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold" style={{ color: `var(--page-primary-70)` }}>
        Foto del barbero <span className="text-zinc-500 text-xs">(Opcional)</span>
      </label>

      {imagen ? (
        <div className="relative w-fit">
          <img
            src={imagen}
            alt="Vista previa"
            className="h-32 w-32 object-cover rounded-lg border"
            style={{ borderColor: `var(--page-primary-80)` }}
          />
          <button
            type="button"
            onClick={onQuitarImagen}
            className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
            subiendo ? "opacity-50 pointer-events-none" : ""
          }`}
          style={{ borderColor: `var(--page-primary-50)` }}
        >
          {subiendo ? (
            <span className="text-sm" style={{ color: "var(--page-primary)" }}>Subiendo...</span>
          ) : (
            <>
              <Upload className="h-6 w-6" style={{ color: "var(--page-primary)" }} />
              <span className="text-sm text-zinc-300">
                Hacé clic para subir una imagen
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) onSeleccionarArchivo(archivo);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={subiendo}
          />
        </label>
      )}

      {errorSubida && <p className="text-red-400 text-sm">{errorSubida}</p>}
    </div>
  );
}