"use client";

import { createServicio } from "@/actions/servicio-actions";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft } from "lucide-react";

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

type CreateServicioFormProps = {
  barberos: Barbero[];
  onClose: () => void;
};

export default function CreateServicioForm({
  barberos,
  onClose,
}: CreateServicioFormProps) {
  const [state, formAction] = useActionState(createServicio, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      alert("✅ Servicio creado exitosamente!");
      onClose(); // Cerramos el modal tras la creación exitosa
    }
  }, [state.success, onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#14110C] border border-[#2C261D] rounded-xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center gap-4 p-6 border-b border-[#2C261D]">
          <button
            onClick={onClose}
            type="button"
            className="text-[#8E8675] hover:text-[#E4E0D9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#E4E0D9]">Nuevo Servicio</h2>
            <p className="text-[#8E8675] text-xs mt-1">
              Completa los datos para agregar un servicio al catálogo.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="overflow-y-auto p-6 flex-1">
          <form ref={formRef} action={formAction} className="space-y-6">
            {/* Información General */}
            <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-[#E8B031] uppercase tracking-wider">
                  Información General
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8E8675] uppercase font-bold">
                    Estado
                  </span>
                  <select
                    name="estado"
                    className="bg-[#14110C] border border-[#2C261D] text-[#E4E0D9] text-xs rounded px-2 py-1 outline-none"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                    Nombre del Servicio{" "}
                    <span className="text-[#E8B031]">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    className="w-full bg-[#14110C] border border-[#2C261D] rounded-lg px-4 py-3 text-[#E4E0D9] outline-none focus:border-[#E8B031] transition-colors"
                    placeholder="Ej: Corte Clásico"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    rows={3}
                    className="w-full bg-[#14110C] border border-[#2C261D] rounded-lg px-4 py-3 text-[#E4E0D9] outline-none focus:border-[#E8B031] transition-colors resize-none"
                    placeholder="Detalla qué incluye el servicio..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                    URL de Imagen (Opcional)
                  </label>
                  <input
                    type="text"
                    name="srcImage"
                    className="w-full bg-[#14110C] border border-[#2C261D] rounded-lg px-4 py-3 text-[#E4E0D9] outline-none focus:border-[#E8B031] transition-colors"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Detalles Técnicos & Precios */}
            <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-6">
              <h3 className="text-xs font-bold text-[#E8B031] uppercase tracking-wider mb-6">
                Precio & Detalles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                    Duración Estimada <span className="text-[#E8B031]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duracion"
                      required
                      min="1"
                      defaultValue="30"
                      className="w-full bg-[#14110C] border border-[#2C261D] rounded-lg px-4 py-3 text-[#E4E0D9] outline-none focus:border-[#E8B031] transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8675]">
                      MIN
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                    Precio Base <span className="text-[#E8B031]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8675] font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      name="precio"
                      required
                      min="0"
                      step="0.01"
                      className="w-full bg-[#14110C] border border-[#2C261D] rounded-lg pl-8 pr-4 py-3 text-[#E4E0D9] outline-none focus:border-[#E8B031] transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                    Descuento
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="descuento"
                      min="0"
                      step="0.01"
                      defaultValue="0"
                      className="w-full bg-[#14110C] border border-[#2C261D] rounded-lg pl-4 pr-8 py-3 text-[#E4E0D9] outline-none focus:border-[#E8B031] transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8675] font-semibold">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                    Seña
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8675] font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      name="senia"
                      min="0"
                      step="0.01"
                      defaultValue="0"
                      className="w-full bg-[#14110C] border border-[#2C261D] rounded-lg pl-8 pr-4 py-3 text-[#E4E0D9] outline-none focus:border-[#E8B031] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {state.error && (
              <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400 text-sm text-center">
                {state.error}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-[#2C261D]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-[#E4E0D9] hover:bg-[#2C261D] transition-colors"
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
      className="bg-[#E8B031] hover:bg-[#d49f2c] text-black font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {pending ? "Creando..." : "Crear Servicio"}
    </button>
  );
}
