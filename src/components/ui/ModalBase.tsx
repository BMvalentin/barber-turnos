"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
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
  animado?: boolean;
};

/* Overlay por defecto: los consumidores pueden sobreescribir la opacidad
   (bg-black/60, bg-black/80, bg-black/90), blur, padding y z-index. */
const OVERLAY_PREDETERMINADA =
  "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm";

/* Contenedor por defecto: solo se aplica si el consumidor NO pasa contenedorClase
   (si pasara ambos, las clases de fondo/borde colisionarían con ganador impredecible). */
const CONTENEDOR_PREDETERMINADO =
  "rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-6 max-h-[90vh] overflow-y-auto";

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
  tituloClase = "text-lg font-semibold tracking-tight text-[var(--admin-texto-primario)]",
  subtituloClase = "text-sm text-[var(--admin-texto-muted)]",
  estiloHeader,
  animado = false,
}: ModalBaseProps) {
  const mostrarHeader = Boolean(header || titulo || subtitulo || onClose);

  return (
    <motion.div
      className={cn(OVERLAY_PREDETERMINADA, overlayClase)}
      {...(animado
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.2, ease: "easeOut" as const },
          }
        : {})}
    >
      <motion.div
        className={cn(
          "relative w-full shadow-2xl shadow-black/40",
          maxWidth,
          contenedorClase ?? CONTENEDOR_PREDETERMINADO,
        )}
        {...(animado
          ? {
              initial: { opacity: 0, scale: 0.96, y: 12 },
              animate: { opacity: 1, scale: 1, y: 0 },
              transition: { duration: 0.25, ease: "easeOut" as const },
            }
          : {})}
      >
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
      </motion.div>
    </motion.div>
  );
}
