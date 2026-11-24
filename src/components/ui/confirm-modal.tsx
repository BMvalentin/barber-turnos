"use client";

import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  apariencia?: "publica";
  etiquetaConfirmar?: string;
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, apariencia, etiquetaConfirmar = "Aceptar" }: ConfirmDialogProps) {
  const volverA = useRef<HTMLElement | null>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const publico = apariencia === "publica";

  return (
    <Dialog.Root open onOpenChange={(abierto) => { if (!abierto) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className={publico ? "velo-modal-publico fixed inset-0 z-[200] bg-black/60" : "fixed inset-0 z-[200] bg-black/45 backdrop-blur-[2px]"} />
        <Dialog.Content
          role="alertdialog"
          data-confirm-modal
          className={`${publico ? "modal-publico entrada-modal-publico max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain" : "admin-card"} fixed top-1/2 left-1/2 z-[201] w-[calc(100%-2rem)] max-w-md -translate-1/2 p-5 sm:p-6`}
          onPointerDownOutside={(evento) => evento.preventDefault()}
          onOpenAutoFocus={(evento) => {
            evento.preventDefault();
            volverA.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            cancelar.current?.focus();
          }}
          onCloseAutoFocus={(evento) => {
            if (volverA.current?.isConnected) {
              evento.preventDefault();
              volverA.current.focus();
            }
          }}
        >
          <Dialog.Title className="text-lg font-semibold text-[var(--admin-texto-primario)]">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-[var(--admin-texto-secundario)] [overflow-wrap:anywhere]">
            {message}
          </Dialog.Description>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Dialog.Close ref={cancelar} className={publico ? "min-h-11 rounded-md border border-[var(--admin-border-fuerte)] px-4 text-sm font-semibold hover:bg-[var(--admin-item)]" : "admin-control"}>
              {publico ? "Volver" : "Cancelar"}
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className={publico ? "min-h-11 rounded-md bg-red-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-900" : "admin-control border-transparent bg-[var(--admin-error-suave,var(--admin-item))] text-[var(--admin-error,var(--color-red-400))]"}
            >
              {etiquetaConfirmar}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
