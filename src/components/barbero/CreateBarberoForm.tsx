"use client";

import { useState, useTransition } from "react";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { createBarbero } from "@/actions/barberos/crear.actions";
import { uploadBarberImages } from "@/actions/mercadopago/subir-barberos.actions";
import { useImagenServicio } from "@/hooks/useImagenServicio";
import type { ServicioOpcion, DiaLaboral } from "@/types/barbero";
import CampoNombreBarbero from "./CampoNombreBarbero";
import CampoEmailBarbero from "./CampoEmailBarbero";
import SeccionImagenServicio from "@/components/servicio/SeccionImagenServicio";
import SelectorServicios from "./SelectorServicios";
import SelectorHorarios from "./SelectorHorarios";
import BotonSubmitPending from "@/components/ui/boton-submit-pending";

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
  const [isPending, startTransition] = useTransition();
  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Barbero creado",
    descripcionExito: "El barbero se ha creado correctamente.",
    descripcionError: "Error al crear barbero",
    refrescar: true,
    onExito: () => {
      setNombre("");
      setEmail("");
      quitarImagen();
      setSelectedServicios([]);
      setSelectedHorarios([]);
      onSuccess?.();
    },
  });
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showServicios, setShowServicios] = useState(false);
  const [showHorarios, setShowHorarios] = useState(false);
  const [uploading, setUploading] = useState(false);
  const {
    selectedFile,
    previewUrl,
    srcImage,
    uploadError,
    manejarArchivo,
    quitarImagen,
    setUploadError,
  } = useImagenServicio();

  const handleNombreChange = (value: string) => {
    setNombre(value);
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    if (!regex.test(value)) {
      setError("El nombre no puede tener números ni caracteres especiales");
    } else {
      setError(null);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.trim() !== "" && !regex.test(value.trim())) {
      setError("El email no es válido");
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
          quitarImagen();
        } else {
          setUploadError("Error al subir la imagen");
          setUploading(false);
          return;
        }
      } catch {
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
        email: email.trim() || null,
        srcImage: finalImageUrl?.trim() || null,
        serviciosIds: selectedServicios,
        margenesIds: selectedHorarios,
      });
      await retroalimentar(result);
    });
  };

  return (
    <div
      className="bg-[var(--admin-surface-elevated)] backdrop-blur-lg rounded-xl p-6 space-y-6 border"
      style={{ borderColor: `var(--page-primary-30)` }}
    >
      <CampoNombreBarbero
        valor={nombre}
        error={error}
        requerido
        onCambio={handleNombreChange}
      />
      <CampoEmailBarbero
        valor={email}
        error={error}
        onCambio={handleEmailChange}
      />
      <SeccionImagenServicio
        previewUrl={previewUrl}
        srcImage={srcImage}
        uploadError={uploadError}
        isPending={uploading}
        variante="barbero"
        onFileChange={manejarArchivo}
        onRemove={quitarImagen}
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
      <BotonSubmitPending
        pendiente={isPending || uploading}
        tipo="button"
        texto="Crear Barbero"
        deshabilitado={!!error}
        onClic={handleSubmit}
        claseAdicional="w-full shadow-lg"
      />
    </div>
  );
}