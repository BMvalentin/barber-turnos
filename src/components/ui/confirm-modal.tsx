// component/ui/confirm-modal.tsx
"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    // Aumenté el z-index de z-50 a z-[60] para que quede sobre el Dialog
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Fondo oscuro con blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onCancel}
      />

      {/* Contenedor del modal */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-amber-900/40 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Línea decorativa superior */}
        <div className="h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        <div className="p-8">
          {/* Icono y título */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 p-2.5 bg-amber-500/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-colors border border-zinc-700 hover:border-zinc-600"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-900/30 transition-all active:scale-[0.97]"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}