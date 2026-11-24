"use client";

import { createServicio } from "@/actions/servicios/crear.actions";
import { ActionStateInicial } from "@/types/action-state";
import type { ActionState } from "@/types/action-state";
import type { ServicioCreado } from "@/types/servicio";
import { useEffect, useRef, useState } from "react";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { useImagenesServicio } from "@/hooks/useImagenesServicio";
import ModalBase from "@/components/ui/ModalBase";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";
import BotonSubmitPending from "@/components/ui/boton-submit-pending";
import CampoDescripcionServicio from "./CampoDescripcionServicio";
import CampoFormulario from "./CampoFormulario";
import SeccionImagenesServicio from "./SeccionImagenesServicio";
import SeccionPrecioDetalles from "./SeccionPrecioDetalles";

const initialState: ActionState<ServicioCreado> = ActionStateInicial;
const OPCIONES_ESTADO_SERVICIO: OpcionDesplegable<string>[] = [
  { valor: "true", etiqueta: "Activo" },
  { valor: "false", etiqueta: "Inactivo" },
];

type CreateServicioFormProps = {
  onClose: () => void;
  onServicioCreado?: (servicio: ServicioCreado) => void;
};

export default function CreateServicioForm({
  onClose,
  onServicioCreado,
}: CreateServicioFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<ActionState<ServicioCreado>>(initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [descripcion, setDescripcion] = useState("");
  const {
    imagenes,
    puedeAgregar,
    error: errorImagenes,
    agregarArchivo,
    removerImagen,
    reemplazarImagen,
    limpiar,
  } = useImagenesServicio();

  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Servicio creado",
    descripcionExito: "El servicio se ha creado correctamente.",
    onExito: () => {
      if (state.data) onServicioCreado?.(state.data);
      formRef.current?.reset();
      limpiar();
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
      titulo="Nuevo servicio"
      maxWidth="max-w-2xl"
      contenedorClase="admin-card flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden"
      headerClase="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--admin-border)] p-4 sm:px-6"
      tituloClase="text-xl font-semibold tracking-tight text-[var(--admin-texto-primario)]"
    >
      <form
        ref={formRef}
        action={async (formData) => {
          if (isPending) return;

          setIsPending(true);

          try {
            for (const [i, slot] of imagenes.entries()) {
              if (slot.tipo === "url") {
                formData.set(`slotTipo${i}`, "url");
                formData.set(`slot${i}`, slot.url);
              } else if (slot.tipo === "archivo") {
                formData.set(`slotTipo${i}`, "archivo");
                formData.set(`slotArchivo${i}`, slot.archivo);
              }
            }

            const result = await createServicio(initialState, formData);
            setState(result);
          } finally {
            setIsPending(false);
          }
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <section className="space-y-3">
            <h3 className="text-base font-semibold">Datos del servicio</h3>

            <div className="space-y-4">
              <CampoFormulario
                label="Nombre del servicio"
                name="nombre"
                placeholder="Ej. Corte clásico"
                errors={state.errors?.nombre}
                required
              />

              <CampoDescripcionServicio
                descripcion={descripcion}
                onDescripcionChange={setDescripcion}
                error={state.errors?.descripcion}
              />

              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[var(--admin-texto-secundario)]">Estado</p>
                <SelectorDesplegable
                  name="estado"
                  opciones={OPCIONES_ESTADO_SERVICIO}
                  valorInicial="true"
                  etiquetaAria="Estado del servicio"
                  className="w-full sm:w-48"
                  claseBoton="min-h-11 rounded-xl"
                />
              </div>

              <SeccionImagenesServicio
                imagenes={imagenes}
                puedeAgregar={puedeAgregar}
                error={errorImagenes}
                isPending={isPending}
                onAgregar={agregarArchivo}
                onRemover={removerImagen}
                onReemplazar={reemplazarImagen}
              />
            </div>
          </section>

          <SeccionPrecioDetalles errors={state.errors} />
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="admin-control"
          >
            Cancelar
          </button>
          <BotonSubmitPending
            pendiente={isPending}
            texto="Crear servicio"
            textoMientrasCarga="Creando…"
            claseAdicional="admin-accion h-auto"
          />
        </div>
      </form>
    </ModalBase>
  );
}
