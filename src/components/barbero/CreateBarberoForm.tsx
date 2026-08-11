"use client";

import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createBarbero } from "@/actions/barberos/crear.actions";
import { uploadBarberImages } from "@/actions/mercadopago/upload-images.actions";
import type { ServicioOpcion, DiaLaboral } from "@/types/barbero";
import CampoNombreBarbero from "./CampoNombreBarbero";
import SelectorImagenBarbero from "./SelectorImagenBarbero";
import SelectorServicios from "./SelectorServicios";
import SelectorHorarios from "./SelectorHorarios";
import BotonSubmitBarbero from "./BotonSubmitBarbero";

type Props = {
  servicios: ServicioOpcion[];
  diasLaborales: DiaLaboral[];
  onSuccess?: () => void;
};

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

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }
    setUploadError(null);
    setSrcImage("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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

  return (
    <div
      className="bg-black/40 backdrop-blur-lg rounded-xl p-6 space-y-6 border"
      style={{ borderColor: `var(--page-primary-30)` }}
    >
      <CampoNombreBarbero
        valor={nombre}
        error={error}
        requerido
        onCambio={handleNombreChange}
      />
      <SelectorImagenBarbero
        imagen={previewUrl || srcImage}
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
        onAlternarSeleccion={toggleServicio}
      />
      <SelectorHorarios
        abierto={showHorarios}
        onAlternarAbierto={() => setShowHorarios(!showHorarios)}
        seleccionados={selectedHorarios}
        diasLaborales={diasLaborales}
        onAlternarSeleccion={toggleHorario}
      />
      <BotonSubmitBarbero
        isPending={isPending || uploading}
        deshabilitado={!!error}
        texto="Crear Barbero"
        onClic={handleSubmit}
      />
    </div>
  );
}