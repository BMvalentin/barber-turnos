"use client";

import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
  dia: string;
  margenes: MargenLaboral[];
};

type Props = {
  servicios: Servicio[];
  diasLaborales: DiaLaboral[];
  onSuccess?: () => void;
  config?: {
    primaryColor?: string | null;
  } | null;
};

const ORDEN_DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

export default function CreateBarberoForm({
  servicios,
  diasLaborales,
  onSuccess,
  config,
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

  const primaryColor = config?.primaryColor || "#d97706"; // Amber por defecto

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

  const handleSubmit = async () => {
    setError(null);
    setUploadError(null);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    let finalImageUrl = srcImage;

    if (selectedFile) {
      setUploading(true);
      try {
        const uploadResult = await uploadBarberImages([selectedFile], "barberia/barberos");
        if (uploadResult.success && uploadResult.images.length > 0) {
          finalImageUrl = uploadResult.images[0];
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
          setSelectedFile(null);
        } else {
          setUploadError("Error al subir la imagen");
          setUploading(false);
          return;
        }
      } catch (err) {
        setUploadError("Error al subir la imagen");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    startTransition(async () => {
      const result = await createBarbero({
        nombre: nombre.trim(),
        srcImage: finalImageUrl?.trim() || null,
        serviciosIds: selectedServicios,
        margenesIds: selectedHorarios,
      });

      if (result.success) {
        toast({
          title: "Barbero creado",
          description: "El barbero se ha creado correctamente.",
          variant: "default",
          duration: 4000,
        });

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
        toast({
          title: "Error",
          description: result.error || "Error al crear barbero",
          variant: "destructive",
          duration: 4000,
        });
      }
    });
  };

  useEffect(() => {
    return () => {
      console.log(diasLaborales);
    };
  }, []);

  return (
    <div 
      className="bg-black/40 backdrop-blur-lg rounded-xl p-6 space-y-6 border"
      style={{ borderColor: `${primaryColor}30` }}
    >
      {/* NOMBRE */}
      <div className="space-y-2">
        <label className="text-sm font-semibold" style={{ color: `${primaryColor}B3` }}>
          Nombre <span style={{ color: primaryColor }}>*</span>
        </label>

        <input
          type="text"
          value={nombre}
          onChange={(e) => handleNombreChange(e.target.value)}
          className="w-full rounded-lg px-3 py-2 bg-black/65 text-white focus:outline-none transition-colors border"
          style={{ 
            borderColor: `${primaryColor}40`,
          }}
          placeholder="Ingrese el nombre del barbero"
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* IMAGEN */}
      <div className="space-y-2">
        <label className="text-sm font-semibold" style={{ color: `${primaryColor}B3` }}>
          Foto del barbero <span className="text-zinc-500 text-xs">(Opcional)</span>
        </label>

        {previewUrl || srcImage ? (
          <div className="relative w-fit">
            <img
              src={previewUrl || srcImage}
              alt="Vista previa"
              className="h-32 w-32 object-cover rounded-lg border"
              style={{ borderColor: `${primaryColor}80` }}
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
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
            style={{ borderColor: `${primaryColor}50` }}
          >
            {uploading ? (
              <span className="text-sm" style={{ color: primaryColor }}>Subiendo...</span>
            ) : (
              <>
                <Upload className="h-6 w-6" style={{ color: primaryColor }} />
                <span className="text-sm text-zinc-300">
                  Hacé clic para subir una imagen
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
          className="w-full flex items-center justify-between p-3 bg-black/60 rounded-lg transition border"
          style={{ borderColor: `${primaryColor}30` }}
        >
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold" style={{ color: `${primaryColor}B3` }}>
              Servicios disponibles
            </span>
            <span className="text-xs" style={{ color: primaryColor }}>
              {selectedServicios.length} seleccionados
            </span>
          </div>

          {showServicios ? (
            <ChevronUp className="h-4 w-4" style={{ color: primaryColor }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: primaryColor }} />
          )}
        </button>

        {showServicios && (
          <div 
            className="p-4 bg-black/60 rounded-lg space-y-2 max-h-60 overflow-y-auto border"
            style={{ borderColor: `${primaryColor}30` }}
          >
            {selectedServicios.length === 0 && (
              <p className="text-xs italic" style={{ color: `${primaryColor}80` }}>
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
                className="flex items-center gap-2 p-2 rounded cursor-pointer transition hover:bg-white/5"
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
          className="w-full flex items-center justify-between p-3 bg-black/65 rounded-lg transition border"
          style={{ borderColor: `${primaryColor}30` }}
        >
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold" style={{ color: `${primaryColor}B3` }}>
              Horarios disponibles
            </span>
            <span className="text-xs" style={{ color: primaryColor }}>
              {selectedHorarios.length} seleccionados
            </span>
          </div>

          {showHorarios ? (
            <ChevronUp className="h-4 w-4" style={{ color: primaryColor }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: primaryColor }} />
          )}
        </button>
        {showHorarios && (
          <div 
            className="p-4 bg-black/60 rounded-lg space-y-4 max-h-80 overflow-y-auto border"
            style={{ borderColor: `${primaryColor}30` }}
          >
            {selectedHorarios.length === 0 && (
              <p className="text-xs italic" style={{ color: `${primaryColor}80` }}>
                No seleccionaste horarios
              </p>
            )}
            {[...diasLaborales]
              .filter((dia) => dia.margenes.length > 0)
              .sort(
                (a, b) =>
                  ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia)
              )
              .map((dia) => (
                <div key={dia.id} className="space-y-2">
                  <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                    {dia.dia}:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[...dia.margenes]
                      .sort((a, b) => a.desde.localeCompare(b.desde))
                      .map((m) => (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 text-white text-xs p-2 bg-black/40 rounded hover:bg-black/60 transition cursor-pointer"
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
        className="w-full text-white shadow-lg transition-all"
        style={{ backgroundColor: primaryColor }}
      >
        {isPending || uploading ? "Guardando..." : "Crear Barbero"}
      </Button>
    </div>
  );
}