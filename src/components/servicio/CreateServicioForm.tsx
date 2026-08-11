"use client";

import { createServicio } from "@/actions/servicios/servicio-actions";
import type { ActionState } from "@/types/action-state";
import type { ServicioCreado } from "@/types/servicio";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CLASES_BOTON_CERRAR } from "@/lib/constants";
import { useImagenServicio } from "@/hooks/useImagenServicio";
import BotonCrearServicio from "./BotonCrearServicio";
import CampoDescripcionServicio from "./CampoDescripcionServicio";
import CampoFormulario from "./CampoFormulario";
import SeccionImagenServicio from "./SeccionImagenServicio";
import SeccionPrecioDetalles from "./SeccionPrecioDetalles";

const initialState: ActionState<ServicioCreado> = {
  success: false,
  error: undefined,
  errors: undefined,
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
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<ActionState<ServicioCreado>>(initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [descripcion, setDescripcion] = useState("");
  const {
    selectedFile,
    previewUrl,
    srcImage,
    uploadError,
    manejarCambioArchivo,
    quitarImagen,
  } = useImagenServicio();

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      quitarImagen();

      toast({
        title: "Servicio creado",
        description: "El servicio se ha creado correctamente.",
        variant: "default",
        duration: 4000,
      });

      onClose();
    }
  }, [state.success]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div 
        className="bg-black/60 border rounded-xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh]"
        style={{ borderColor: "var(--page-secondary)" }}
      >
        {/* Header Modal */}
        <div 
          className="flex justify-between items-center gap-4 p-6 border-b"
          style={{ borderColor: "var(--page-secondary)" }}
        >
          <div>
            <h2 className="text-xl font-bold text-[#E4E0D9]">Nuevo Servicio</h2>
            <p className="text-[#8E8675] text-xs mt-1">
              Completa los datos para agregar un servicio al catálogo.
            </p>
          </div>
          {/* Acciones del Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className={CLASES_BOTON_CERRAR}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Formulario */}
        <div className="overflow-y-auto p-6 flex-1">
          <form
            ref={formRef}
            action={async (formData) => {
              if (isPending) return;

              setIsPending(true);

              try {
                if (selectedFile) {
                  formData.set("image", selectedFile);
                }

                const result = await createServicio(initialState, formData);
                setState(result);
              } finally {
                setIsPending(false);
              }
            }}
            className="space-y-6"
          >
            {/* Información General */}
            <div 
              className="bg-black/70 border rounded-xl p-6"
              style={{ borderColor: "var(--page-secondary)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--page-primary)" }}
                >
                  Información General
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8E8675] uppercase font-bold">
                    Estado
                  </span>
                  <select
                    name="estado"
                    className="bg-black/70 border text-[#E4E0D9] text-xs rounded px-2 py-1 outline-none"
                    style={{ borderColor: "var(--page-secondary)" }}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <CampoFormulario
                  label="Nombre del Servicio"
                  name="nombre"
                  placeholder="Ej: Corte Clásico"
                  errors={state.errors?.nombre}
                  required
                />

                <CampoDescripcionServicio
                  descripcion={descripcion}
                  onDescripcionChange={setDescripcion}
                  error={state.errors?.descripcion}
                />

                <SeccionImagenServicio
                  previewUrl={previewUrl}
                  srcImage={srcImage}
                  uploadError={uploadError}
                  isPending={isPending}
                  onFileChange={manejarCambioArchivo}
                  onRemove={quitarImagen}
                />
              </div>
            </div>

            {/* Detalles Técnicos & Precios */}
            <SeccionPrecioDetalles errors={state.errors} />

            {state.error && (
              <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400 text-sm text-center">
                {state.error}
              </div>
            )}

            <div 
              className="flex justify-end gap-4 pt-4 border-t"
              style={{ borderColor: "var(--page-secondary)" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 hover:cursor-pointer rounded-lg font-bold text-xs uppercase tracking-wider text-[#E4E0D9] transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                Cancelar
              </button>
              <BotonCrearServicio pending={isPending} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
