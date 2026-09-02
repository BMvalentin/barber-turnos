"use client";

import { useRef, useState, type ReactNode } from "react";
import RecortadorImagenModal from "@/components/ui/imagenes/RecortadorImagenModal";

type ProporcionRecorte = number | "libre";

type SelectorImagenConRecorteProps = {
  alConfirmar: (archivo: File) => void;
  children: ReactNode;
  className?: string;
  proporcion?: ProporcionRecorte;
  deshabilitado?: boolean;
  accept?: string;
};

export default function SelectorImagenConRecorte({
  alConfirmar,
  children,
  className,
  proporcion = "libre",
  deshabilitado = false,
  accept = "image/*",
}: SelectorImagenConRecorteProps) {
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null);
  const referenciaInput = useRef<HTMLInputElement>(null);

  const limpiarSeleccion = () => {
    setArchivoPendiente(null);
    if (referenciaInput.current) referenciaInput.current.value = "";
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
          onChange={(evento) => setArchivoPendiente(evento.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>
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
