"use client";

import { actualizarServicio } from "@/actions/servicios/actualizar.actions";
import { useActionState, useState, useRef, useEffect } from "react";
import { ActionStateInicial } from "@/types/action-state";
import type { ActionState } from "@/types/action-state";
import type { Servicio, ServicioCreado } from "@/types/servicio";
import { DollarSign, Percent, Clock } from "lucide-react";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { useImagenServicio } from "@/hooks/useImagenServicio";
import ModalBase from "@/components/ui/ModalBase";
import BotonSubmitPending from "@/components/ui/boton-submit-pending";
import CampoFormulario from "./CampoFormulario";
import SeccionImagenServicio from "./SeccionImagenServicio";

const initialState: ActionState<ServicioCreado> = ActionStateInicial;

interface EditServicioModalProps {
  servicio: Servicio;
  onClose: () => void;
}

export default function EditServicioModal({
  servicio,
  onClose,
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
    onExito: onClose,
  });

  // Estados locales para controlar los inputs (opcional, pero útil para validaciones inmediatas si las tuvieras)
  const [nombre, setNombre] = useState(servicio.nombre);
  const [precio, setPrecio] = useState(servicio.precio);
  const [descripcion, setDescripcion] = useState(servicio.descripcion || "");
  const [duracion, setDuracion] = useState(servicio.duracion);
  const [descuento, setDescuento] = useState(servicio.descuento);
  const [senia, setSenia] = useState(servicio.senia);
  const {
    selectedFile,
    previewUrl,
    srcImage,
    uploadError,
    manejarArchivo,
    quitarImagen,
  } = useImagenServicio({
    previewInicial: servicio.srcImage || null,
    srcImageInicial: servicio.srcImage || "",
  });

  // Efecto para cerrar el modal si la actualización fue exitosa
  useEffect(() => {
    if (state.success) {
      void retroalimentar(state);
    }
  }, [state, retroalimentar]);

  return (
    <ModalBase
      onClose={onClose}
      titulo={
        <>
          Editar Servicio:{" "}
          <span className="font-normal text-[#8E8675]">{servicio.nombre}</span>
        </>
      }
      maxWidth="max-w-7xl"
      overlayClase="bg-black/90 p-4 sm:p-6 overflow-y-auto"
      contenedorClase="bg-black/70 backdrop-blur-2xl border border-[#2C261D] rounded-xl relative flex flex-col max-h-[95vh]"
      headerClase="flex items-center justify-between p-6 border-b border-[#2C261D]"
      tituloClase="text-2xl font-bold text-[#E4E0D9]"
    >
      {/* Formulario envolvente para capturar la acción del botón en el header */}
      <form
        ref={formRef}
        action={async (formData) => {
          if (isPending) return;

          if (selectedFile) {
            formData.set("image", selectedFile);
          }

          formAction(formData);
        }}
        className="flex flex-col flex-1 overflow-hidden"
      >
        {/* Inputs Ocultos necesarios para la acción */}
        <input type="hidden" name="id" value={servicio.id} />
        <input
          type="hidden"
          name="srcImage"
          value={srcImage}
        />

        {/* --- CUERPO DEL FORMULARIO (Scrollable) --- */}
          <div className="overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            {/* Columna Izquierda: INFORMACIÓN GENERAL */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-[#E8B031] uppercase tracking-wider">
                INFORMACIÓN GENERAL
              </h3>

              <div className="space-y-4">
                {/* Nombre del Servicio */}
                <CampoFormulario
                  label="Nombre del Servicio"
                  name="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Corte Clásico y Barba"
                  errors={state.errors?.nombre}
                  required
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider">
                      Descripción del Servicio
                    </label>
                    <span className={`text-[9px] font-bold uppercase ${descripcion.length > 450 ? 'text-[#E8B031]' : 'text-[#8E8675]'}`}>
                      {descripcion.length} / 500
                    </span>
                  </div>
                  <textarea
                    name="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
                    rows={3}
                    className={`w-full bg-black/70 backdrop-blur-2xl  border ${state.errors?.descripcion ? "border-red-500" : "border-[#2C261D]"} rounded-lg px-4 py-3 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors resize-none`}
                    placeholder="Detalla qué incluye el servicio..."
                  />
                  {state.errors?.descripcion && (
                    <p className="mt-1 text-[10px] text-red-500 font-medium">{state.errors.descripcion[0]}</p>
                  )}
                </div>

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

            {/* Columna Derecha: PRICING & DETAILS */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-[#E8B031] uppercase tracking-wider">
                PRECIOS & DETALLES
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Duración Estimada */}
                <CampoFormulario
                  label="Duración Estimada"
                  name="duracion"
                  type="number"
                  value={duracion}
                  onChange={(e) => setDuracion(Number(e.target.value))}
                  icon={Clock}
                  unit="MIN"
                  errors={state.errors?.duracion}
                  required
                />

                {/* Precio Base */}
                <CampoFormulario
                  label="Precio Base"
                  name="precio"
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(Number(e.target.value))}
                  icon={DollarSign}
                  errors={state.errors?.precio}
                  required
                />

                {/* Descuento */}
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

                {/* Seña (Down Payment) */}
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
            </div>

            {/* Mensaje de Error si existe */}
            {state.error && (
              <div className="col-span-1 md:col-span-2 bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400 text-sm text-center">
                {state.error}
              </div>
            )}
          </div>

          <div className="flex justify-end px-6 py-4 gap-4 border-t border-[#2C261D] bg-black/70 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 hover:cursor-pointer rounded-lg font-bold text-xs uppercase tracking-wider text-[#E4E0D9] hover:bg-[#2C261D] transition-colors"
          >
            Cancelar
          </button>
          <BotonSubmitPending
            pendiente={isPending}
            texto="Actualizar"
            textoMientrasCarga="Actualizando..."
            mostrarSpinner={false}
            claseAdicional="font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg"
          />
        </div>
        </form>
    </ModalBase>
  );
}
