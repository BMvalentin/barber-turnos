"use client";

import { createServicio } from "@/actions/servicios/crear.actions";
import { ActionStateInicial } from "@/types/action-state";
import type { ActionState } from "@/types/action-state";
import type { ServicioCreado } from "@/types/servicio";
import { useEffect, useRef, useState } from "react";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { useImagenServicio } from "@/hooks/useImagenServicio";
import ModalBase from "@/components/ui/ModalBase";
import BotonSubmitPending from "@/components/ui/boton-submit-pending";
import CampoDescripcionServicio from "./CampoDescripcionServicio";
import CampoFormulario from "./CampoFormulario";
import SeccionImagenServicio from "./SeccionImagenServicio";
import SeccionPrecioDetalles from "./SeccionPrecioDetalles";

const initialState: ActionState<ServicioCreado> = ActionStateInicial;

type CreateServicioFormProps = {
  onClose: () => void;
};

export default function CreateServicioForm({
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
    manejarArchivo,
    quitarImagen,
  } = useImagenServicio();

  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Servicio creado",
    descripcionExito: "El servicio se ha creado correctamente.",
    onExito: () => {
      formRef.current?.reset();
      quitarImagen();
      onClose();
    },
  });

  useEffect(() => {
    if (state.success || state.error) {
      void retroalimentar(state);
    }
  }, [state, retroalimentar]);

  return (
    <ModalBase
      onClose={onClose}
      titulo="Nuevo Servicio"
      subtitulo="Completa los datos para agregar un servicio al catálogo."
      maxWidth="max-w-4xl"
      overlayClase="bg-black/90 p-4 sm:p-6 overflow-y-auto"
      contenedorClase="bg-[var(--admin-surface)] border border-[var(--admin-border-fuerte)] rounded-xl relative flex flex-col max-h-[90vh]"
      headerClase="flex justify-between items-center gap-4 p-6 border-b border-[var(--admin-border)]"
      tituloClase="text-xl font-bold text-[var(--admin-texto-primario)]"
      subtituloClase="text-[var(--admin-texto-muted)] text-xs mt-1"
    >
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
              className="bg-[var(--admin-surface-elevated)] border rounded-xl p-6"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--page-primary-tinta)" }}
                >
                  Información General
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--admin-texto-secundario)] uppercase font-bold">
                    Estado
                  </span>
                  <select
                    name="estado"
                    className="bg-[var(--admin-surface-elevated)] border text-[var(--admin-texto-primario)] text-xs rounded px-2 py-1 transition-colors duration-150 focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]"
                    style={{ borderColor: "var(--admin-border)" }}
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
                  onFileChange={manejarArchivo}
                  onRemove={quitarImagen}
                />
              </div>
            </div>

            {/* Detalles Técnicos & Precios */}
            <SeccionPrecioDetalles errors={state.errors} />

            <div 
              className="flex justify-end gap-4 pt-4 border-t"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 hover:cursor-pointer rounded-lg font-bold text-xs uppercase tracking-wider text-[var(--admin-texto-primario)] hover:bg-[var(--admin-item-hover)] transition-colors duration-150"
                style={{ backgroundColor: 'transparent' }}
              >
                Cancelar
              </button>
              <BotonSubmitPending
                pendiente={isPending}
                texto="Crear Servicio"
                textoMientrasCarga="Creando..."
                claseAdicional="font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg"
              />
            </div>
          </form>
        </div>
    </ModalBase>
  );
}
