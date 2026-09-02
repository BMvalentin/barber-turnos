"use server";

import { uploadToCloudinary } from "@/lib/cloudinary-uploader/subir-uno";
import { LIMITE_IMAGEN_CONFIGURACION_BYTES } from "@/lib/imagenes/limites-imagen-configuracion";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { validarArchivoImagen } from "@/lib/validar-imagen";

// Sube una imagen de branding (logo, favicon, fondo del home) a Cloudinary
async function uploadConfigImageBase(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file || file.size === 0) {
    return { success: false, error: "No se recibió ningún archivo." };
  }

  const validacion = await validarArchivoImagen(file, {
    tamanoMaximoBytes: LIMITE_IMAGEN_CONFIGURACION_BYTES,
  });

  if (!validacion.ok) {
    return { success: false, error: validacion.error };
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
