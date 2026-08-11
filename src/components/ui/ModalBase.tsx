"use client";

import type { CSSProperties, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CLASES_BOTON_CERRAR } from "@/lib/constants";

type ModalBaseProps = {
  children: ReactNode;
  onClose?: () => void;
  titulo?: ReactNode;
  subtitulo?: ReactNode;
  header?: ReactNode;
  maxWidth?: string;
  overlayClase?: string;
  contenedorClase?: string;
  headerClase?: string;
  tituloClase?: string;
  subtituloClase?: string;
  estiloHeader?: CSSProperties;
};

/* Overlay por defecto: los consumidores pueden sobreescribir la opacidad
   (bg-black/60, bg-black/80, bg-black/90), blur, padding y z-index. */
const OVERLAY_PREDETERMINADA =
  "fixed inset-0 bg-black/60 flex items-center justify-center z-50";

export default function ModalBase({
  children,
  onClose,
  titulo,
  subtitulo,
  header,
  maxWidth = "max-w-lg",
  overlayClase,
  contenedorClase,
  headerClase = "flex items-center justify-between gap-4",
  tituloClase = "text-xl font-bold text-white",
  subtituloClase = "text-sm text-zinc-400",
  estiloHeader,
}: ModalBaseProps) {
  const mostrarHeader = Boolean(header || titulo || subtitulo || onClose);

  return (
    <div className={cn(OVERLAY_PREDETERMINADA, overlayClase)}>
      <div className={cn("w-full shadow-2xl", maxWidth, contenedorClase)}>
        {header ? (
          header
        ) : mostrarHeader ? (
          <div className={headerClase} style={estiloHeader}>
            <div>
              {titulo && <h2 className={tituloClase}>{titulo}</h2>}
              {subtitulo && <p className={subtituloClase}>{subtitulo}</p>}
            </div>
            {onClose && (
              <button type="button" onClick={onClose} className={CLASES_BOTON_CERRAR}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
