"use client";

import { actualizarServicio } from "@/actions/servicios/actualizar.actions";
import { useActionState, useState, useRef, useEffect } from "react";
import { ActionStateInicial } from "@/types/action-state";
import type { ActionState } from "@/types/action-state";
import type { Servicio, ServicioCreado } from "@/types/servicio";
import { DollarSign, Percent, Clock } from "lucide-react";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { useImagenesServicio } from "@/hooks/useImagenesServicio";
import ModalBase from "@/components/ui/ModalBase";
import BotonSubmitPending from "@/components/ui/boton-submit-pending";
import CampoDescripcionServicio from "./CampoDescripcionServicio";
import CampoFormulario from "./CampoFormulario";
import SeccionImagenesServicio from "./SeccionImagenesServicio";

const initialState: ActionState<ServicioCreado> = ActionStateInicial;

interface EditServicioModalProps {
  servicio: Servicio;
  onClose: () => void;
  onServicioActualizado?: (servicio: ServicioCreado) => void;
}

export default function EditServicioModal({
  servicio,
  onClose,
  onServicioActualizado,
}: EditServicioModalProps) {
  // Estado para la acción del servidor
  const [state, formAction, isPending] = useActionState(
    actualizarServicio,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Servicio actualizado",
    descripcionExito: "El servicio se ha actualizado correctamente.",
    onExito: () => {
      if (state.data) onServicioActualizado?.(state.data);
      onClose();
    },
  });

  // Estados locales para controlar los inputs (opcional, pero útil para validaciones inmediatas si las tuvieras)
  const [nombre, setNombre] = useState(servicio.nombre);
  const [precio, setPrecio] = useState(servicio.precio);
  const [descripcion, setDescripcion] = useState(servicio.descripcion || "");
  const [duracion, setDuracion] = useState(servicio.duracion);
  const [descuento, setDescuento] = useState(servicio.descuento);
  const [senia, setSenia] = useState(servicio.senia);
  const {
    imagenes,
    puedeAgregar,
    error: errorImagenes,
    agregarArchivo,
    removerImagen,
    reemplazarImagen,
  } = useImagenesServicio({ iniciales: servicio.imagenes });

  // Efecto para cerrar el modal si la actualización fue exitosa
  useEffect(() => {
    if (state.success || state.error) {
      void retroalimentar(state);
    }
  }, [state, retroalimentar]);

  return (
    <ModalBase
      onClose={onClose}
      titulo="Editar servicio"
      subtitulo={servicio.nombre}
      maxWidth="max-w-4xl"
      contenedorClase="admin-card flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden"
      headerClase="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--admin-border)] p-4 sm:px-6"
      tituloClase="text-xl font-semibold tracking-tight text-[var(--admin-texto-primario)]"
      subtituloClase="mt-1 text-sm text-[var(--admin-texto-muted)] [overflow-wrap:anywhere]"
    >
      <form
        ref={formRef}
        action={async (formData) => {
          if (isPending) return;

          for (const [i, slot] of imagenes.entries()) {
            if (slot.tipo === "url") {
              formData.set(`slotTipo${i}`, "url");
              formData.set(`slot${i}`, slot.url);
            } else if (slot.tipo === "archivo") {
              formData.set(`slotTipo${i}`, "archivo");
              formData.set(`slotArchivo${i}`, slot.archivo);
            }
          }

          formAction(formData);
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <input type="hidden" name="id" value={servicio.id} />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 sm:p-6 lg:grid-cols-2 lg:gap-6">
          <section className="min-w-0 space-y-3">
            <h3 className="text-base font-semibold">Datos del servicio</h3>

            <div className="space-y-4">
              <CampoFormulario
                label="Nombre del servicio"
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Corte clásico y barba"
                errors={state.errors?.nombre}
                required
              />

              <CampoDescripcionServicio descripcion={descripcion} onDescripcionChange={setDescripcion} error={state.errors?.descripcion} />

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

          <section className="min-w-0 space-y-3 border-t border-[var(--admin-border)] pt-4 lg:border-0 lg:pt-0">
            <h3 className="text-base font-semibold">Precios y duración</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoFormulario
                label="Duración estimada"
                name="duracion"
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                icon={Clock}
                unit="min"
                errors={state.errors?.duracion}
                required
              />

              <CampoFormulario
                label="Precio base"
                name="precio"
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                icon={DollarSign}
                errors={state.errors?.precio}
                required
              />

              <CampoFormulario
                label="Descuento"
                name="descuento"
                type="number"
                step="0.01"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                icon={Percent}
                errors={state.errors?.descuento}
              />

              <CampoFormulario
                label="Seña"
                name="senia"
                type="number"
                step="0.01"
                value={senia}
                onChange={(e) => setSenia(Number(e.target.value))}
                icon={DollarSign}
                errors={state.errors?.senia}
              />
            </div>
          </section>
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
            texto="Guardar cambios"
            textoMientrasCarga="Guardando…"
            mostrarSpinner={false}
            claseAdicional="admin-accion h-auto"
          />
        </div>
      </form>
    </ModalBase>
  );
}
