"use client";

import { useState } from "react";
import { esImagenValida } from "@/lib/es-imagen-valida";

type OpcionesUseImagenServicio = {
  previewInicial?: string | null;
  srcImageInicial?: string;
};

export function useImagenServicio(opciones: OpcionesUseImagenServicio = {}) {
  const { previewInicial = null, srcImageInicial = "" } = opciones;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(previewInicial);
  const [srcImage, setSrcImage] = useState<string>(srcImageInicial);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const manejarArchivo = (archivo: File | null) => {
    if (!archivo) return;

    if (!esImagenValida(archivo)) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }

    setUploadError(null);
    setSrcImage("");
    setSelectedFile(archivo);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(archivo));
  };

  const quitarImagen = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setSrcImage("");
    setUploadError(null);
  };

  const establecerSrcImagen = (url: string) => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setSrcImage(url);
    setUploadError(null);
  };

  return {
    selectedFile,
    previewUrl,
    srcImage,
    uploadError,
    manejarArchivo,
    quitarImagen,
    establecerSrcImagen,
    setUploadError,
  };
}
