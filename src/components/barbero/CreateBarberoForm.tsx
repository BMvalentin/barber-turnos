"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createBarbero } from "@/actions/barbero.actions";
import { ChevronDown, ChevronUp, Upload, X } from "lucide-react";
import { uploadBarberImages } from "@/actions/upload-images.actions";

type Servicio = {
  id: string;
  nombre: string;
};

type MargenLaboral = {
  id: string;
  desde: string;
  hasta: string;
  diaId: string;
};

type DiaLaboral = {
  id: string;
  dia: number;
  margenes: MargenLaboral[];
};

type Props = {
  servicios: Servicio[];
  diasLaborales: DiaLaboral[];
  onSuccess?: () => void;
};

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function CreateBarberoForm({
  servicios,
  diasLaborales,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nombre, setNombre] = useState("");
  const [srcImage, setSrcImage] = useState("");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showServicios, setShowServicios] = useState(false);
  const [showHorarios, setShowHorarios] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ✅ VALIDACIÓN EN TIEMPO REAL
  const handleNombreChange = (value: string) => {
    setNombre(value);

    const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;

    if (!regex.test(value)) {
      setError("El nombre no puede tener números ni caracteres especiales");
    } else {
      setError(null);
    }
  };

  const toggleServicio = (id: string) => {
    setSelectedServicios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleHorario = (id: string) => {
    setSelectedHorarios((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }

    // Limpiar errores y estado previo
    setUploadError(null);
    setSrcImage("");
    setSelectedFile(file);

    // Crear URL temporal para previsualización
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

  const handleSubmit = async () => {
    setError(null);
    setUploadError(null);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    let finalImageUrl = srcImage; // mantiene valor previo (útil en edición, pero acá siempre "")

    // Si el usuario seleccionó un archivo, lo subimos AHORA
    if (selectedFile) {
      setUploading(true);
      try {
        const uploadResult = await uploadBarberImages([selectedFile], "barberia/barberos");
        if (uploadResult.success && uploadResult.images.length > 0) {
          finalImageUrl = uploadResult.images[0];
          // limpiar la vista previa local
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
          setSelectedFile(null);
        } else {
          setUploadError("Error al subir la imagen");
          setUploading(false);
          return; // no continuar si falla la subida
        }
      } catch (err) {
        setUploadError("Error al subir la imagen");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Ahora creamos el barbero con la URL definitiva
    startTransition(async () => {
      const result = await createBarbero({
        nombre: nombre.trim(),
        srcImage: finalImageUrl?.trim() || null,
        serviciosIds: selectedServicios,
        margenesIds: selectedHorarios,
      });

      if (result.success) {
        toast.success("Barbero creado correctamente");

        setNombre("");
        setSrcImage("");
        setPreviewUrl(null);
        setSelectedFile(null);
        setSelectedServicios([]);
        setSelectedHorarios([]);

        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error || "Error al crear barbero");
        toast.error(result.error || "Error");
      }
    });
  };

  return (
    <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-6 space-y-6">


      {/* NOMBRE */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-amber-200/70">
          Nombre <span className="text-amber-500">*</span>
        </label>

        <input
          type="text"
          value={nombre}
          onChange={(e) => handleNombreChange(e.target.value)}
          className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Ingrese el nombre del barbero"
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* IMAGEN */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-amber-200/70">
          Foto del barbero <span className="text-amber-200/50 text-xs">(Opcional)</span>
        </label>

        {previewUrl || srcImage ? (
          <div className="relative w-fit">
            <img
              src={previewUrl || srcImage}
              alt="Vista previa"
              className="h-32 w-32 object-cover rounded-lg border border-amber-500/50"
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
            className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-amber-900/40 rounded-lg cursor-pointer hover:border-amber-500/50 transition ${uploading ? "opacity-50 pointer-events-none" : ""
              }`}
          >
            {uploading ? (
              <span className="text-amber-400 text-sm">Subiendo...</span>
            ) : (
              <>
                <Upload className="h-6 w-6 text-amber-500" />
                <span className="text-sm text-amber-200/70">
                  Hacé clic para subir una imagen
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
        {uploadError && <p className="text-red-400 text-sm">{uploadError}</p>}
      </div>

      {/* SERVICIOS */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowServicios(!showServicios)}
          className="w-full flex items-center justify-between p-3 bg-black/60 border border-amber-900/30 rounded-lg hover:bg-amber-500/10 transition"
        >
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-amber-200/70">
              Servicios disponibles
            </span>
            <span className="text-xs text-amber-400">
              {selectedServicios.length} seleccionados
            </span>
          </div>

          {showServicios ? (
            <ChevronUp className="h-4 w-4 text-amber-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {showServicios && (
          <div className="p-4 bg-black/60 border border-amber-900/30 rounded-lg space-y-2 max-h-60 overflow-y-auto">

            {selectedServicios.length === 0 && (
              <p className="text-xs text-amber-500/60 italic">
                No seleccionaste ningún servicio
              </p>
            )}

            {servicios.length === 0 && (
              <p className="text-xs text-red-400">
                No hay servicios cargados
              </p>
            )}

            {servicios.map((servicio) => (
              <label
                key={servicio.id}
                className="flex items-center gap-2 p-2 hover:bg-amber-500/10 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedServicios.includes(servicio.id)}
                  onChange={() => toggleServicio(servicio.id)}
                />
                <span className="text-white text-sm">
                  {servicio.nombre}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* HORARIOS */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowHorarios(!showHorarios)}
          className="w-full flex items-center justify-between p-3 bg-black/60 border border-amber-900/30 rounded-lg hover:bg-amber-500/10 transition"
        >
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-amber-200/70">
              Horarios disponibles
            </span>
            <span className="text-xs text-amber-400">
              {selectedHorarios.length} seleccionados
            </span>
          </div>

          {showHorarios ? (
            <ChevronUp className="h-4 w-4 text-amber-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {showHorarios && (
          <div className="p-4 bg-black/60 border border-amber-900/30 rounded-lg space-y-3 max-h-80 overflow-y-auto">

            {selectedHorarios.length === 0 && (
              <p className="text-xs text-amber-500/60 italic">
                No seleccionaste horarios
              </p>
            )}

            {diasLaborales.map((dia) => (
              <div key={dia.id}>
                <p className="text-sm text-amber-400">
                  {DIAS_SEMANA[dia.dia]}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {dia.margenes.map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 text-white text-xs p-2 bg-black/40 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedHorarios.includes(m.id)}
                        onChange={() => toggleHorario(m.id)}
                      />
                      {m.desde} - {m.hasta}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTÓN */}
      <Button
        onClick={handleSubmit}
        disabled={isPending || uploading || !!error}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {isPending || uploading ? "Guardando..." : "Crear Barbero"}
      </Button>
    </div>
  );
}