"use client";

import { createServicio, ActionState } from "@/actions/servicio-actions";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, DollarSign, Upload, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const initialState: ActionState = {
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
  const [state, setState] = useState<ActionState>(initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [descripcion, setDescripcion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [srcImage, setSrcImage] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      setSrcImage("");
      setUploadError(null);

      toast({
        title: "Servicio creado",
        description: "El servicio se ha creado correctamente.",
        variant: "default",
        duration: 4000,
      });

      onClose();
    }
  }, [state.success]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }

    setUploadError(null);
    setSrcImage("");
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(null);
    setPreviewUrl(null);
    setSrcImage("");
    setUploadError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#14110C] border border-[#2C261D] rounded-xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center gap-4 p-6 border-b border-[#2C261D]">
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-amber-600/20 rounded-lg transition-all group"
            title="Regresar"
          >
            <ArrowLeft className="h-6 w-6 text-amber-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
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
                <InputField
                  label="Nombre del Servicio"
                  name="nombre"
                  placeholder="Ej: Corte Clásico"
                  errors={state.errors?.nombre}
                  required
                />

                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider">
                      Descripción
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
                    className={`w-full bg-[#14110C] border ${state.errors?.descripcion ? 'border-red-500' : 'border-[#2C261D]'} rounded-lg px-4 py-3 text-[#E4E0D9] outline-none focus:border-[#E8B031] transition-colors resize-none`}
                    placeholder="Detalla qué incluye el servicio..."
                  />
                  {state.errors?.descripcion && (
                    <p className="text-[10px] text-red-500 font-medium">{state.errors.descripcion[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider">
                    Imagen del Servicio
                  </label>

                  {previewUrl || srcImage ? (
                    <div className="relative w-fit">
                      <img
                        src={previewUrl || srcImage}
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
                    <label
                      className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#2C261D] rounded-lg cursor-pointer hover:border-[#E8B031] transition ${isPending ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                      {isPending ? (
                        <span className="text-[#E8B031] text-sm">
                          Subiendo...
                        </span>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-[#E8B031]" />
                          <span className="text-sm text-[#8E8675]">
                            Hacé clic para subir una imagen
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isPending}
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

            {/* Detalles Técnicos & Precios */}
            <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-6">
              <h3 className="text-xs font-bold text-[#E8B031] uppercase tracking-wider mb-6">
                Precio & Detalles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Duración Estimada"
                  name="duracion"
                  type="number"
                  defaultValue="30"
                  unit="MIN"
                  errors={state.errors?.duracion}
                  required
                />

                <InputField
                  label="Precio Base"
                  name="precio"
                  type="number"
                  step="0.01"
                  icon={DollarSign}
                  errors={state.errors?.precio}
                  required
                />

                <InputField
                  label="Descuento"
                  name="descuento"
                  type="number"
                  defaultValue="0"
                  unit="%"
                  errors={state.errors?.descuento}
                />

                <InputField
                  label="Seña"
                  name="senia"
                  type="number"
                  defaultValue="0"
                  icon={DollarSign}
                  errors={state.errors?.senia}
                />
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
              <SubmitButton pending={isPending} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


function SubmitButton({
  pending,
}: {
  pending: boolean;
}) {

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
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider">
        {label} {required && <span className="text-[#E8B031]">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8675]" />
        )}
        <input
          {...props}
          className={`w-full bg-[#14110C] border ${errors ? "border-red-500" : "border-[#2C261D]"
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
        <p className="text-[10px] text-red-500 font-medium">
          {errors[0]}
        </p>
      )}
    </div>
  );
}