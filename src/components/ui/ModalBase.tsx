"use client";

import { useId, useRef, type CSSProperties, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CLASES_BOTON_CERRAR } from "@/lib/constants";

type ModalBaseProps = {
  children: ReactNode;
  id?: string;
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
  apariencia?: "publica";
  dialogoAccesible?: boolean;
  etiquetaDialogo?: string;
  onCloseAutoFocus?: (evento: Event) => void;
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
  id,
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
  apariencia,
  dialogoAccesible = false,
  etiquetaDialogo,
  onCloseAutoFocus,
}: ModalBaseProps) {
  const mostrarHeader = Boolean(header || titulo || subtitulo || onClose);
  const focoPrevio = useRef<HTMLElement | null>(null);
  const descripcionId = useId();

  if (apariencia === "publica" || dialogoAccesible) {
    return (
      <Dialog.Root open onOpenChange={(abierto) => { if (!abierto) onClose?.(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className={cn("fixed inset-0 z-[110] bg-black/60", apariencia === "publica" && "velo-modal-publico", overlayClase)} />
          <Dialog.Content
            {...(id ? { id } : {})}
            aria-describedby={subtitulo && !header ? descripcionId : undefined}
            className={cn(
              "fixed top-1/2 left-1/2 z-[111] max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] -translate-1/2 overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100%-3rem)]",
              apariencia === "publica" && "modal-publico entrada-modal-publico",
              maxWidth,
              contenedorClase ?? "p-4 sm:p-6",
            )}
            onPointerDownOutside={(evento) => evento.preventDefault()}
            onEscapeKeyDown={(evento) => {
              const selectorAbierto = evento.target instanceof Element && evento.target.closest(
                "[role='combobox'][aria-expanded='true'], [data-selector-desplegable-opciones]",
              );
              if (!onClose || selectorAbierto) evento.preventDefault();
            }}
            onOpenAutoFocus={() => {
              focoPrevio.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            }}
            onCloseAutoFocus={(evento) => {
              onCloseAutoFocus?.(evento);
              if (!evento.defaultPrevented && focoPrevio.current?.isConnected) {
                evento.preventDefault();
                focoPrevio.current.focus({ preventScroll: true });
              }
            }}
          >
            {header || !titulo ? (
              <Dialog.Title asChild><span className="sr-only">{etiquetaDialogo ?? "Diálogo"}</span></Dialog.Title>
            ) : null}
            {header ?? (mostrarHeader && (
              <div className={headerClase} style={estiloHeader}>
                <div className="min-w-0">
                  {titulo && <Dialog.Title className={tituloClase}>{titulo}</Dialog.Title>}
                  {subtitulo && <Dialog.Description id={descripcionId} className={subtituloClase}>{subtitulo}</Dialog.Description>}
                </div>
                {onClose && (
                  <Dialog.Close aria-label="Cerrar" className="grid size-11 shrink-0 place-items-center rounded-md text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item)] hover:text-[var(--admin-texto-primario)]">
                    <X className="size-5" aria-hidden="true" />
                  </Dialog.Close>
                )}
              </div>
            ))}
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

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
        id={id}
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
              <button type="button" onClick={onClose} aria-label="Cerrar" className={CLASES_BOTON_CERRAR}>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ) : null}
        {children}
      </motion.div>
    </motion.div>
  );
}
