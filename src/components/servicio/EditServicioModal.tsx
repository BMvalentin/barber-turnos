"use client";

import { actualizarServicio } from "@/actions/servicio-actions"; // Asumimos que esta acción maneja la actualización
import { useActionState, useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  LayoutGrid,
  DollarSign,
  Percent,
  Clock,
} from "lucide-react";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

// Definición local de Servicio para evitar dependencias
type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  srcImage: string | null;
  estado: boolean;
  duracion: number;
  precio: number;
  descuento: number;
  senia: number;
};

interface EditServicioModalProps {
  servicio: Servicio;
  onClose: () => void;
}

export default function EditServicioModal({
  servicio,
  onClose,
}: EditServicioModalProps) {
  // Estado para la acción del servidor
  const [state, formAction] = useActionState(actualizarServicio, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Estados locales para controlar los inputs (opcional, pero útil para validaciones inmediatas si las tuvieras)
  const [nombre, setNombre] = useState(servicio.nombre);
  const [srcImage, setSrcImage] = useState(servicio.srcImage || "");
  const [precio, setPrecio] = useState(servicio.precio);
  const [descripcion, setDescripcion] = useState(servicio.descripcion || "");
  const [duracion, setDuracion] = useState(servicio.duracion);
  const [descuento, setDescuento] = useState(servicio.descuento);
  const [senia, setSenia] = useState(servicio.senia);

  // Efecto para cerrar el modal si la actualización fue exitosa
  useEffect(() => {
    if (state.success) {
      alert("✅ Servicio actualizado exitosamente!");
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      {/* Contenedor Principal del Modal */}
      <div className="bg-[#14110C] border border-[#2C261D] rounded-xl w-full max-w-7xl shadow-2xl relative flex flex-col max-h-[95vh]">
        {/* Formulario envolvente para capturar la acción del botón en el header */}
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Inputs Ocultos necesarios para la acción */}
          <input type="hidden" name="id" value={servicio.id} />
          <input type="hidden" name="estado" value={String(servicio.estado)} />

          {/* --- HEADER DEL MODAL (Estilo imagen) --- */}
          <div className="flex items-center justify-between p-6 border-b border-[#2C261D]">
            <div className="flex items-center gap-6">
              <button
                onClick={onClose}
                type="button"
                className="flex items-center gap-2 text-[10px] font-bold text-[#8E8675] uppercase tracking-wider hover:text-[#E4E0D9] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Regresar
              </button>
              <h2 className="text-2xl font-bold text-[#E4E0D9]">
                Editar Servicio:{" "}
                <span className="font-normal text-[#8E8675]">
                  {servicio.nombre}
                </span>
              </h2>
            </div>

            {/* Acciones del Header */}
            <div className="flex items-center gap-4">
              {/* VISTA PREVIA ELIMINADA */}
              <SubmitButton />
            </div>
          </div>

          {/* --- CUERPO DEL FORMULARIO (Scrollable) --- */}
          <div className="overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            {/* Columna Izquierda: INFORMACIÓN GENERAL */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-[#E8B031] uppercase tracking-wider">
                INFORMACIÓN GENERAL
              </h3>

              <div className="space-y-4">
                {/* Nombre del Servicio */}
                <InputField
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
                    className={`w-full bg-[#1C1812] border ${state.errors?.descripcion ? "border-red-500" : "border-[#2C261D]"} rounded-lg px-4 py-3 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors resize-none`}
                    placeholder="Detalla qué incluye el servicio..."
                  />
                  {state.errors?.descripcion && (
                    <p className="mt-1 text-[10px] text-red-500 font-medium">{state.errors.descripcion[0]}</p>
                  )}
                </div>

                {/* URL de Imagen */}
                <InputField
                  label="URL de Imagen"
                  name="srcImage"
                  value={srcImage}
                  onChange={(e) => setSrcImage(e.target.value)}
                  placeholder="https://tu-imagen.com/foto.jpg"
                  errors={state.errors?.srcImage}
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
                <InputField
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
                <InputField
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
                <InputField
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
                <InputField
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

          {/* SECCIÓN DE BARBEROS Y BOTÓN ELIMINAR QUITADOS DEL FINAL */}
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

// Botón de Submit ubicado en el Header
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[#E8B031] hover:bg-[#d49f2c] text-black font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {pending ? "Actualizando..." : "Actualizar"}
    </button>
  );
}

// Componente reutilizable para los campos de input (Estilo imagen)
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
  errors?: string[];
  unit?: string;
}

function InputField({
  label,
  icon: Icon,
  unit,
  errors,
  required,
  ...props
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
        {label} {required && <span className="text-[#E8B031]">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8675]" />
        )}
        <input
          {...props}
          className={`w-full bg-[#1C1812] border ${errors ? "border-red-500" : "border-[#2C261D]"
            } rounded-lg ${Icon ? "pl-11" : "pl-4"} ${unit ? "pr-14" : "pr-4"
            } py-3 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors`}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8675] uppercase">
            {unit}
          </span>
        )}
      </div>
      {errors && (
        <p className="mt-1 text-[10px] text-red-500 font-medium">
          {errors[0]}
        </p>
      )}
    </div>
  );
}
