"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  // En SSR document no existe, evitamos renderizar hasta estar en el cliente
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-confirm-modal
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        pointerEvents: "auto",
      }}
    >
      <div
        className="relative w-[min(92vw,400px)] rounded-xl border bg-[var(--admin-surface-elevated)] p-6 shadow-2xl shadow-black/40"
        style={{ borderColor: "var(--admin-border)" }}
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-md p-1.5 text-[var(--admin-texto-muted)] transition-colors hover:bg-white/5 hover:text-[var(--admin-texto-primario)]"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="mb-4 text-base font-semibold text-[var(--admin-texto-primario)]">
          {title}
        </h3>
        <p className="mb-8 text-sm text-[var(--admin-texto-secundario)]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--admin-texto-secundario)] transition-colors hover:bg-white/5 hover:text-[var(--admin-texto-primario)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}