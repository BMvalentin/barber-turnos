"use client";

import { useState } from "react";
import { esImagenValida } from "@/lib/es-imagen-valida";
import { MAX_IMAGENES_SERVICIO } from "@/lib/servicio-imagenes/constantes";

export type SlotImagenServicio =
  | { id: string; tipo: "url"; url: string; preview: string }
  | { id: string; tipo: "archivo"; archivo: File; preview: string };

type OpcionesUseImagenesServicio = {
  iniciales?: string[];
};

export function useImagenesServicio(opciones: OpcionesUseImagenesServicio = {}) {
  const { iniciales = [] } = opciones;

  const [imagenes, setImagenes] = useState<SlotImagenServicio[]>(() =>
    iniciales
      .filter((url) => url.trim() !== "")
      .map((url) => ({
        id: crypto.randomUUID(),
        tipo: "url" as const,
        url,
        preview: url,
      })),
  );
  const [error, setError] = useState<string | null>(null);

  const maximo = MAX_IMAGENES_SERVICIO;
  const total = imagenes.length;
  const puedeAgregar = total < maximo;

  const revocarBlob = (slot: SlotImagenServicio) => {
    if (slot.preview.startsWith("blob:")) {
      URL.revokeObjectURL(slot.preview);
    }
  };

  const agregarArchivo = (archivo: File) => {
    if (!esImagenValida(archivo)) {
      setError("El archivo debe ser una imagen");
      return;
    }

    if (total >= maximo) {
      setError("Máximo 3 imágenes por servicio");
      return;
    }

    setError(null);
    setImagenes((previas) => [
      ...previas,
      {
        id: crypto.randomUUID(),
        tipo: "archivo",
        archivo,
        preview: URL.createObjectURL(archivo),
      },
    ]);
  };

  const removerImagen = (id: string) => {
    setImagenes((previas) => {
      const objetivo = previas.find((slot) => slot.id === id);
      if (objetivo) revocarBlob(objetivo);
      return previas.filter((slot) => slot.id !== id);
    });
    setError(null);
  };

  const reemplazarImagen = (id: string, archivo: File) => {
    if (!esImagenValida(archivo)) {
      setError("El archivo debe ser una imagen");
      return;
    }

    setError(null);
    setImagenes((previas) => {
      const objetivo = previas.find((slot) => slot.id === id);
      if (objetivo) revocarBlob(objetivo);

      return previas.map((slot) =>
        slot.id === id
          ? {
              id,
              tipo: "archivo" as const,
              archivo,
              preview: URL.createObjectURL(archivo),
            }
          : slot,
      );
    });
  };

  const limpiar = () => {
    setImagenes((previas) => {
      previas.forEach(revocarBlob);
      return [];
    });
    setError(null);
  };

  return {
    imagenes,
    maximo,
    total,
    puedeAgregar,
    error,
    agregarArchivo,
    removerImagen,
    reemplazarImagen,
    limpiar,
    setError,
  };
}
