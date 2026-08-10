"use server";

import {
  uploadMultipleToCloudinary,
  uploadToCloudinary,
} from "@/lib/cloudinary-uploader";
import { requerirAdmin } from "@/lib/seguridad";

const MAX_CONFIG_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

// Sube una imagen de branding (logo, favicon, fondo del home) a Cloudinary
export async function uploadConfigImage(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  const sesion = await requerirAdmin();
  if (!sesion) return { success: false, error: "No autorizado" };

  if (!file || file.size === 0) {
    return { success: false, error: "No se recibió ningún archivo." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "El archivo debe ser una imagen." };
  }

  if (file.size > MAX_CONFIG_IMAGE_BYTES) {
    return { success: false, error: "La imagen no puede superar los 2 MB." };
  }

  const result = await uploadToCloudinary({
    file,
    folder: "barberia/config",
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "No se pudo subir la imagen.",
    };
  }

  return { success: true, url: result.url };
}

export async function uploadBarberImages(
  files: File[],
  folder?: string
): Promise<{ success: boolean; images: string[]; error?: string }> {
  const sesion = await requerirAdmin();
  if (!sesion) return { success: false, images: [], error: "No autorizado" };

  const finalFolder = folder ?? "barbers";
  // Subida múltiple con opciones comunes
  const results = await uploadMultipleToCloudinary(files, {
    folder: finalFolder,
  });

  // Extraemos solo las URLs exitosas
  const images = results
    .filter((r) => r.success)
    .map((r) => r.url as string);

  return {
    success: true,
    images,
  };
}