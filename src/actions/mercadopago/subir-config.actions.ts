"use server";

import { uploadToCloudinary } from "@/lib/cloudinary-uploader/subir-uno";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { validarArchivoImagen } from "@/lib/validar-imagen";

const MAX_CONFIG_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

// Sube una imagen de branding (logo, favicon, fondo del home) a Cloudinary
async function uploadConfigImageBase(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file || file.size === 0) {
    return { success: false, error: "No se recibió ningún archivo." };
  }

  const validacion = await validarArchivoImagen(file);

  if (!validacion.ok) {
    return { success: false, error: validacion.error };
  }

  if (file.size > MAX_CONFIG_IMAGE_BYTES) {
    return { success: false, error: "La imagen no puede superar los 2 MB." };
  }

  const result = await uploadToCloudinary({
    file,
    folder: "barberia/config",
    resourceType: "image",
  });

  if (!result.success) {
    return {
      success: false,
      error: "No se pudo subir la imagen. Intentalo de nuevo.",
    };
  }

  return { success: true, url: result.url };
}

export const uploadConfigImage = exigirAdmin(uploadConfigImageBase);
