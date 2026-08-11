"use client";

import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { updateBarbero } from "@/actions/barberos/editar.actions";
import { uploadBarberImages } from "@/actions/mercadopago/upload-images.actions";
import type { ServicioOpcion, DiaLaboral, BarberoEdicion } from "@/types/barbero";
import CampoNombreBarbero from "./CampoNombreBarbero";
import SelectorImagenBarbero from "./SelectorImagenBarbero";
import SelectorServicios from "./SelectorServicios";
import SelectorHorarios from "./SelectorHorarios";
import BotonSubmitBarbero from "./BotonSubmitBarbero";
import EncabezadoModalBarbero from "./EncabezadoModalBarbero";

type EditBarberoModalProps = {
  barbero: BarberoEdicion;
  servicios: ServicioOpcion[];
  diasLaborales: DiaLaboral[];
  onClose: () => void;
};

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }
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
      }
    } catch (err) {
      setUploadError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
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
          borderStyle: "solid",
        }}
      >
        <EncabezadoModalBarbero onCerrar={onClose} />
        <div className="space-y-4">
          <CampoNombreBarbero
            valor={nombre}
            error={error}
            onCambio={setNombre}
          />
          <SelectorImagenBarbero
            imagen={srcImage}
            subiendo={uploading}
            errorSubida={uploadError}
            onSeleccionarArchivo={handleFileChange}
            onQuitarImagen={handleRemoveImage}
          />
          <SelectorServicios
            abierto={showServicios}
            onAlternarAbierto={() => setShowServicios(!showServicios)}
            seleccionados={selectedServicios}
            opciones={servicios}
            onAlternarSeleccion={(id) =>
              setSelectedServicios((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
          />
          <SelectorHorarios
            abierto={showHorarios}
            onAlternarAbierto={() => setShowHorarios(!showHorarios)}
            seleccionados={selectedHorarios}
            diasLaborales={diasLaborales}
            onAlternarSeleccion={(id) =>
              setSelectedHorarios((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
          />
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
              borderStyle: "solid",
            }}
          >
            Cancelar
          </Button>
          <BotonSubmitBarbero
            isPending={isPending}
            anchoCompleto={false}
            texto="Guardar Cambios"
            onClic={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}