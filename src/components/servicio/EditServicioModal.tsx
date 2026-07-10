"use client";

import { actualizarServicio } from "@/actions/servicio-actions"; // Asumimos que esta acción maneja la actualización
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  DollarSign,
  Percent,
  Clock,
  Upload,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";

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
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Estados locales para controlar los inputs (opcional, pero útil para validaciones inmediatas si las tuvieras)
  const [nombre, setNombre] = useState(servicio.nombre);
  const [srcImage, setSrcImage] = useState(servicio.srcImage || "");
  const [precio, setPrecio] = useState(servicio.precio);
  const [descripcion, setDescripcion] = useState(servicio.descripcion || "");
  const [duracion, setDuracion] = useState(servicio.duracion);
  const [descuento, setDescuento] = useState(servicio.descuento);
  const [senia, setSenia] = useState(servicio.senia);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(servicio.srcImage || null);
  }, [servicio.srcImage]);

  // Efecto para cerrar el modal si la actualización fue exitosa
  useEffect(() => {
    if (state.success) {
      toast({
        title: "Servicio actualizado",
        description: "El servicio se ha actualizado correctamente.",
        variant: "default",
        duration: 4000,
      });
      onClose();
    }
  }, [state.success, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }

    setUploadError(null);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setSrcImage("");
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      {/* Contenedor Principal del Modal */}
      <div className="bg-black/70 backdrop-blur-2xl border border-[#2C261D] rounded-xl w-full max-w-7xl shadow-2xl relative flex flex-col max-h-[95vh]">
        {/* Formulario envolvente para capturar la acción del botón en el header */}
        <form
          ref={formRef}
          action={async (formData) => {
            if (isPending) return;

            setIsPending(true);

            try {
              if (selectedFile) {
                formData.set("image", selectedFile);
              }
              const result = await actualizarServicio(initialState, formData);
              setState(result);
            } finally {
              setIsPending(false);
            }
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

          {/* --- HEADER DEL MODAL (Estilo imagen) --- */}
          <div className="flex items-center justify-between p-6 border-b border-[#2C261D]">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-bold text-[#E4E0D9]">
                Editar Servicio:{" "}
                <span className="font-normal text-[#8E8675]">
                  {servicio.nombre}
                </span>
              </h2>
            </div>

            {/* Acciones del Header */}
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="rounded-sm ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-amber-600 hover:bg-amber-700 p-1 text-white hover:cursor-pointer">
                <X className="h-4 w-4" />
              </button>
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
                    className={`w-full bg-black/70 backdrop-blur-2xl  border ${state.errors?.descripcion ? "border-red-500" : "border-[#2C261D]"} rounded-lg px-4 py-3 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors resize-none`}
                    placeholder="Detalla qué incluye el servicio..."
                  />
                  {state.errors?.descripcion && (
                    <p className="mt-1 text-[10px] text-red-500 font-medium">{state.errors.descripcion[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider">
                    Imagen del Servicio
                  </label>

                  {previewUrl ? (
                    <div className="relative w-fit">
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="h-32 w-32 object-cover rounded-lg border border-[#2C261D]"
                      />

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#2C261D] rounded-lg cursor-pointer hover:border-[#E8B031] transition">
                      <Upload className="h-6 w-6 text-[#E8B031]" />
                      <span className="text-sm text-[#8E8675]">
                        Hacé clic para seleccionar una imagen
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  )}

                  {uploadError && (
                    <p className="text-red-500 text-sm">
                      {uploadError}
                    </p>
                  )}
                </div>
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
        <div className="flex justify-end px-6 py-4 gap-4 border-t border-[#2C261D] bg-black/70 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 hover:cursor-pointer rounded-lg font-bold text-xs uppercase tracking-wider text-[#E4E0D9] hover:bg-[#2C261D] transition-colors"
          >
            Cancelar
          </button>
          <SubmitButton pending={isPending} />
        </div>
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

// Botón de Submit ubicado en el Header
function SubmitButton({
  pending,
}: {
  pending: boolean;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {pending ? "Actualizando..." : "Actualizar"}
    </Button>
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
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 z-99" />
        )}
        <input
          {...props}
          className={`w-full bg-black/70 backdrop-blur-2xl border ${errors ? "border-red-500" : "border-[#2C261D]"
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
