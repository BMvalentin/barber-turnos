"use client";

import { Button } from "@/components/ui/button/Button";
import { toast } from "@/lib/toast";
import { useState, useTransition } from "react";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { updateBarbero } from "@/actions/barberos/editar.actions";
import { uploadBarberImages } from "@/actions/mercadopago/subir-barberos.actions";
import { esImagenValida } from "@/lib/es-imagen-valida";
import { useImagenServicio } from "@/hooks/useImagenServicio";
import type { ServicioOpcion, DiaLaboral, BarberoEdicion } from "@/types/barbero";
import CampoNombreBarbero from "./CampoNombreBarbero";
import SeccionImagenServicio from "@/components/servicio/SeccionImagenServicio";
import SelectorServicios from "./SelectorServicios";
import SelectorHorarios from "./SelectorHorarios";
import ModalBase from "@/components/ui/ModalBase";
import BotonSubmitPending from "@/components/ui/boton-submit-pending";

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
  const [isPending, startTransition] = useTransition();
  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Barbero actualizado",
    descripcionExito: "Los cambios se han guardado correctamente.",
    descripcionError: "Error al actualizar el barbero",
    refrescar: true,
    onExito: onClose,
  });
  const [nombre, setNombre] = useState(barbero.nombre || "");
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
  const {
    srcImage,
    previewUrl,
    uploadError,
    establecerSrcImagen,
    quitarImagen,
    setUploadError,
  } = useImagenServicio({ srcImageInicial: barbero.srcImage || "" });

  const handleFileChange = async (file: File) => {
    if (!esImagenValida(file)) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadBarberImages([file], "barberia/barberos");
      if (result.success && result.images.length > 0) {
        establecerSrcImagen(result.images[0]);
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
      if (!result.success) {
        const errorMsg =
          typeof result.error === "string" ? result.error : "Datos inválidos";
        setError(errorMsg);
      }
      await retroalimentar(result);
    });
  };

  return (
    <ModalBase
      onClose={onClose}
      titulo="Editar Barbero"
      maxWidth="max-w-2xl"
      overlayClase="bg-black/80 backdrop-blur-md p-4"
      contenedorClase="max-h-[90vh] overflow-y-auto bg-black/70 rounded-xl p-6 space-y-6 border border-[var(--page-primary)]"
      headerClase="flex justify-between items-center border-b pb-4 border-[var(--page-primary-40)]"
      tituloClase="text-2xl font-bold text-white"
    >
      <div className="space-y-4">
          <CampoNombreBarbero
            valor={nombre}
            error={error}
            onCambio={setNombre}
          />
          <SeccionImagenServicio
            previewUrl={previewUrl}
            srcImage={srcImage}
            uploadError={uploadError}
            isPending={uploading}
            variante="barbero"
            onFileChange={handleFileChange}
            onRemove={quitarImagen}
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
          <BotonSubmitPending
            pendiente={isPending}
            tipo="button"
            texto="Guardar Cambios"
            onClic={handleSubmit}
            claseAdicional="flex-1 hover:opacity-90"
          />
        </div>
    </ModalBase>
  );
}