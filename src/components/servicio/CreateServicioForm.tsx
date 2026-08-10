"use client";

import { createServicio } from "@/actions/servicio-actions";
import type { ActionState } from "@/types/action-state";
import { useEffect, useRef, useState } from "react";
import { DollarSign, Upload, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { CLASES_BOTON_CERRAR, ESTILO_FONDO_MARCA } from "@/lib/constants";
import { Button } from "../ui/button";

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
                    <span 
                      className={`text-[9px] font-bold uppercase`}
                      style={{ color: descripcion.length > 450 ? "var(--page-primary)" : '#8E8675' }}
                    >
                      {descripcion.length} / 500
                    </span>
                  </div>
                  <textarea
                    name="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
                    rows={3}
                    className={`w-full bg-black/70 border rounded-lg px-4 py-3 text-[#E4E0D9] outline-none transition-colors resize-none`}
                    style={{ 
                      borderColor: state.errors?.descripcion ? '#ef4444' : "var(--page-secondary)",
                    }}
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
                        className="h-32 w-32 object-cover rounded-lg border"
                        style={{ borderColor: "var(--page-secondary)" }}
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
                      className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
                        isPending ? "opacity-50 pointer-events-none" : ""
                      }`}
                      style={{ borderColor: "var(--page-secondary)" }}
                    >
                      {isPending ? (
                        <span className="text-sm" style={{ color: "var(--page-primary)" }}>
                          Subiendo...
                        </span>
                      ) : (
                        <>
                          <Upload className="h-6 w-6" style={{ color: "var(--page-primary)" }} />
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
            <div 
              className="bg-black/70 border rounded-xl p-6"
              style={{ borderColor: "var(--page-secondary)" }}
            >
              <h3 
                className="text-xs font-bold uppercase tracking-wider mb-6"
                style={{ color: "var(--page-primary)" }}
              >
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
              <SubmitButton pending={isPending} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button 
      className="font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-[var(--page-primary-foreground)]"
      style={ESTILO_FONDO_MARCA}
      type="submit"
      disabled={pending}
    >
      {pending ? "Creando..." : "Crear Servicio"}
    </Button>
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
        {label} {required && <span style={{ color: "var(--page-primary)" }}>*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8675]" />
        )}
        <input
          {...props}
          className={`w-full bg-black/70 border rounded-lg ${Icon ? "pl-11" : "pl-4"} ${
            unit ? "pr-14" : "pr-4"
          } py-3 text-[#E4E0D9] text-sm outline-none transition-colors`}
          style={{
            borderColor: errors ? "#ef4444" : "var(--page-secondary)",
          }}
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