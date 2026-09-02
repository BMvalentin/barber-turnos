"use client";

import { useRef, useState, type ReactNode } from "react";
import RecortadorImagenModal from "@/components/ui/imagenes/RecortadorImagenModal";

type ProporcionRecorte = number | "libre";

const TIPOS_IMAGEN_ADMITIDOS = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/avif",
]);

type SelectorImagenConRecorteProps = {
  alConfirmar: (archivo: File) => void;
  children: ReactNode;
  className?: string;
  proporcion?: ProporcionRecorte;
  deshabilitado?: boolean;
  accept?: string;
  tamanoMaximoBytes?: number;
};

export default function SelectorImagenConRecorte({
  alConfirmar,
  children,
  className,
  proporcion = "libre",
  deshabilitado = false,
  accept = "image/*",
  tamanoMaximoBytes,
}: SelectorImagenConRecorteProps) {
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const referenciaInput = useRef<HTMLInputElement>(null);

  const limpiarSeleccion = () => {
    setArchivoPendiente(null);
    setError(null);
    if (referenciaInput.current) referenciaInput.current.value = "";
  };

  const manejarSeleccionArchivo = (archivo: File | null) => {
    setError(null);

    if (!archivo) return;

    if (!TIPOS_IMAGEN_ADMITIDOS.has(archivo.type)) {
      setError("Seleccioná una imagen válida en formato PNG, JPEG, WebP, GIF, BMP o AVIF.");
      if (referenciaInput.current) referenciaInput.current.value = "";
      return;
    }

    if (tamanoMaximoBytes && archivo.size > tamanoMaximoBytes) {
      const tamanoMaximoMegabytes = Math.round(tamanoMaximoBytes / 1024 / 1024);
      setError(`La imagen no puede superar los ${tamanoMaximoMegabytes} MB.`);
      if (referenciaInput.current) referenciaInput.current.value = "";
      return;
    }

    setArchivoPendiente(archivo);
  };

  return (
    <>
      <label className={className}>
        {children}
        <input
          ref={referenciaInput}
          type="file"
          accept={accept}
          disabled={deshabilitado}
          onChange={(evento) => manejarSeleccionArchivo(evento.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>
      {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
      {archivoPendiente && (
        <RecortadorImagenModal
          archivo={archivoPendiente}
          proporcion={proporcion}
          alCancelar={limpiarSeleccion}
          alConfirmar={(archivo) => {
            alConfirmar(archivo);
            limpiarSeleccion();
          }}
        />
      )}
    </>
  );
}
