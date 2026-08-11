"use client";

import { Upload, X } from "lucide-react";

type SeccionImagenServicioProps = {
  previewUrl: string | null;
  srcImage: string;
  uploadError: string | null;
  isPending: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

export default function SeccionImagenServicio({
  previewUrl,
  srcImage,
  uploadError,
  isPending,
  onFileChange,
  onRemove,
}: SeccionImagenServicioProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider">
        Imagen del Servicio
      </label>

      {previewUrl || srcImage ? (
        <div className="relative w-fit">
          <img
            src={previewUrl || srcImage}
            alt="Vista previa"
            className="h-32 w-32 object-cover rounded-lg border"
            style={{ borderColor: "var(--page-secondary)" }}
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
          style={{ borderColor: "var(--page-secondary)" }}
        >
          {isPending ? (
            <span className="text-sm" style={{ color: "var(--page-primary)" }}>
              Subiendo...
            </span>
          ) : (
            <>
              <Upload className="h-6 w-6" style={{ color: "var(--page-primary)" }} />
              <span className="text-sm text-[#8E8675]">
                Hacé clic para subir una imagen
              </span>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isPending}
          />
        </label>
      )}

      {uploadError && (
        <p className="text-red-500 text-sm">
          {uploadError}
        </p>
      )}
    </div>
  );
}