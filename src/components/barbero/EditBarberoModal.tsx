"use client";

import { updateBarbero } from "@/actions/barbero.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

type Barbero = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
};

type EditBarberoModalProps = {
  barbero: Barbero;
  onClose: () => void;
};

export default function EditBarberoModal({
  barbero,
  onClose,
}: EditBarberoModalProps) {
  const [state, formAction] = useActionState(updateBarbero, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      
      <div className="w-full max-w-md">
        
        <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-6 space-y-6 shadow-2xl shadow-amber-900/20">
          
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Editar Barbero
            </h2>

            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* FORM */}
          <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={barbero.id} />

            {/* NOMBRE */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200/70">
                Nombre <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                required
                defaultValue={barbero.nombre || ""}
                className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Ingrese el nombre"
              />
            </div>

            {/* IMAGEN */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200/70">
                Imagen <span className="text-amber-200/50 text-xs">(Opcional)</span>
              </label>
              <input
                type="text"
                name="srcImage"
                defaultValue={barbero.srcImage || ""}
                className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="URL de la imagen"
              />
            </div>

            {/* ESTADO */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                name="estado"
                value="true"
                defaultChecked={barbero.estado}
                className="w-4 h-4 rounded border-amber-900/30 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-amber-200/70">
                Barbero activo
              </span>
            </div>

            {/* ERROR */}
            {state.error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded p-3">
                <p className="text-red-400 text-sm">{state.error}</p>
              </div>
            )}

            {/* BOTONES */}
            <div className="flex gap-2 pt-4 border-t border-amber-900/30">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-amber-900/30 text-amber-200 rounded-lg hover:bg-amber-500/10 transition-colors"
              >
                Cancelar
              </button>

              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Guardando..." : "Guardar Cambios"}
    </button>
  );
}