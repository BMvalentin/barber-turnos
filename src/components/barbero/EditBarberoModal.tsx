"use client";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { updateBarbero } from "@/actions/barbero.actions";
import { ChevronDown, ChevronUp, Upload, X } from "lucide-react";
import { uploadBarberImages } from "@/actions/upload-images.actions";

type Barbero = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
  servicios?: any[];
  horarios?: any[];
};

type EditBarberoModalProps = {
  barbero: Barbero;
  servicios: any[];
  diasLaborales: any[];
  onClose: () => void;
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

export default function EditBarberoModal({
  barbero,
  servicios,
  diasLaborales,
  onClose,
}: EditBarberoModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nombre, setNombre] = useState(barbero.nombre || "");
  const [srcImage, setSrcImage] = useState(barbero.srcImage || "");
  const [estado, setEstado] = useState(barbero.estado);
  const [selectedServicios, setSelectedServicios] = useState<string[]>(
    barbero.servicios?.map((s) => s.servicio.id) || []
  );
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>(
    barbero.horarios?.map((h) => h.margenLaboralId) || []
  );

  const [showServicios, setShowServicios] = useState(false);
  const [showHorarios, setShowHorarios] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }

    setSelectedFile(file);
    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadBarberImages([file], "barberia/barberos");
      if (result.success && result.images.length > 0) {
        setSrcImage(result.images[0]);
        toast({
          title: "Imagen subida",
          description: "La imagen se ha subido correctamente.",
          variant: "default",
          duration: 4000,
        });
      } else {
        toast({
          title: "Error",
          description: "Error al subir la imagen",
          variant: "destructive",
          duration: 4000,
        });
        setUploadError("Error al subir la imagen");
        setSelectedFile(null);
      }
    } catch (err) {
      setUploadError("Error al subir la imagen");
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setSrcImage("");
    setUploadError(null);
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateBarbero({
        id: barbero.id,
        nombre: nombre.trim(),
        srcImage: srcImage.trim() === "" ? null : srcImage.trim(),
        estado: Boolean(estado),
        serviciosIds: selectedServicios || [],
        margenesIds: selectedHorarios,
      });

      if (result.success) {
        toast({
          title: "Barbero actualizado",
          description: "Los cambios se han guardado correctamente.",
          variant: "default",
          duration: 4000,
        });
        onClose();
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar el barbero",
          variant: "destructive",
          duration: 4000,
        });
        const errorMsg =
          typeof result.error === "string" ? result.error : "Datos inválidos";
        setError(errorMsg);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black/70 rounded-xl p-6 space-y-6 shadow-2xl"
        style={{ 
          borderColor: "var(--page-primary)",
          borderWidth: "1px",
          borderStyle: "solid"
        }}
      >
        <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: `var(--page-primary-40)` }}>
          <h2 className="text-2xl font-bold text-white">Editar Barbero</h2>
          <button 
            onClick={onClose} 
            className="rounded-sm transition-opacity hover:opacity-100 focus:outline-none p-1 text-[var(--page-primary-foreground)] hover:cursor-pointer"
            style={{ backgroundColor: "var(--page-primary)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--page-primary)" }}>
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-black/60 rounded-lg p-2 text-white focus:outline-none"
              style={{ 
                borderColor: `var(--page-primary-60)`,
                borderWidth: "1px",
                borderStyle: "solid" 
              }}
            />
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--page-primary)" }}>
              Foto del barbero
            </label>

            {srcImage ? (
              <div className="relative w-fit">
                <img
                  src={srcImage}
                  alt="Vista previa"
                  className="h-32 w-32 object-cover rounded-lg"
                  style={{ 
                    borderColor: "var(--page-primary)",
                    borderWidth: "2px",
                    borderStyle: "solid" 
                  }}
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
                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-lg cursor-pointer transition ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
                style={{ 
                  borderColor: "var(--page-primary)",
                  borderWidth: "2px",
                  borderStyle: "dashed" 
                }}
              >
                {uploading ? (
                  <span className="text-sm" style={{ color: "var(--page-primary)" }}>Subiendo...</span>
                ) : (
                  <>
                    <Upload className="h-6 w-6" style={{ color: "var(--page-primary)" }} />
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
            {uploadError && (
              <p className="text-red-400 text-sm">{uploadError}</p>
            )}
          </div>

          {/* Servicios */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowServicios(!showServicios)}
              className="w-full flex justify-between items-center p-3 bg-black/65 rounded-lg"
              style={{ 
                borderColor: `var(--page-primary-50)`,
                borderWidth: "1px",
                borderStyle: "solid" 
              }}
            >
              <span style={{ color: "var(--page-primary)", fontWeight: 600 }}>
                Servicios ({selectedServicios.length})
              </span>
              {showServicios ? <ChevronUp style={{ color: "var(--page-primary)" }} /> : <ChevronDown style={{ color: "var(--page-primary)" }} />}
            </button>
            {showServicios && (
              <div 
                className="p-4 bg-black/40 rounded-lg grid grid-cols-2 gap-2"
                style={{ 
                  borderColor: `var(--page-primary-40)`,
                  borderWidth: "1px",
                  borderStyle: "solid" 
                }}
              >
                {servicios.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 text-white text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServicios.includes(s.id)}
                      onChange={() =>
                        setSelectedServicios((prev) =>
                          prev.includes(s.id)
                            ? prev.filter((x) => x !== s.id)
                            : [...prev, s.id]
                        )
                      }
                    />
                    {s.nombre}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Horarios */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowHorarios(!showHorarios)}
              className="w-full flex justify-between items-center p-3 bg-black/65 rounded-lg"
              style={{ 
                borderColor: `var(--page-primary-50)`,
                borderWidth: "1px",
                borderStyle: "solid" 
              }}
            >
              <span style={{ color: "var(--page-primary)", fontWeight: 600 }}>
                Horarios ({selectedHorarios.length})
              </span>
              {showHorarios ? <ChevronUp style={{ color: "var(--page-primary)" }} /> : <ChevronDown style={{ color: "var(--page-primary)" }} />}
            </button>
            {showHorarios && (
              <div 
                className="p-4 bg-black/40 rounded-lg space-y-4 max-h-80 overflow-y-auto"
                style={{ 
                  borderColor: `var(--page-primary-40)`,
                  borderWidth: "1px",
                  borderStyle: "solid" 
                }}
              >
                {[...diasLaborales]
                  .filter((dia) => dia.margenes.length > 0)
                  .sort(
                    (a, b) =>
                      ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia)
                  )
                  .map((dia) => (
                    <div key={dia.id} className="space-y-2">
                      <p className="text-sm font-semibold" style={{ color: "var(--page-primary)" }}>
                        {dia.dia}:
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {[...dia.margenes]
                          .sort((a: any, b: any) =>
                            a.desde.localeCompare(b.desde)
                          )
                          .map((m: any) => (
                            <label
                              key={m.id}
                              className="flex items-center gap-2 text-white text-xs p-2 bg-black/40 rounded hover:bg-black/60 transition cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedHorarios.includes(m.id)}
                                onChange={() =>
                                  setSelectedHorarios((prev) =>
                                    prev.includes(m.id)
                                      ? prev.filter((x) => x !== m.id)
                                      : [...prev, m.id]
                                  )
                                }
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

          <label className="flex items-center gap-2 text-sm font-medium text-white">
            <input
              type="checkbox"
              checked={estado}
              onChange={(e) => setEstado(e.target.checked)}
            />
            Barbero Activo
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-4 border-t" style={{ borderColor: `var(--page-primary-40)` }}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent text-white hover:bg-white/10"
            style={{ 
              borderColor: `var(--page-primary-60)`,
              borderWidth: "1px",
              borderStyle: "solid" 
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 text-[var(--page-primary-foreground)] transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--page-primary)" }}
          >
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}