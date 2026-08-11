"use client";

import { useState, type ChangeEvent } from "react";

export function useImagenServicio() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [srcImage, setSrcImage] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const manejarCambioArchivo = (e: ChangeEvent<HTMLInputElement>) => {
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

  const quitarImagen = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(null);
    setPreviewUrl(null);
    setSrcImage("");
    setUploadError(null);
  };

  return {
    selectedFile,
    previewUrl,
    srcImage,
    uploadError,
    manejarCambioArchivo,
    quitarImagen,
  };
}