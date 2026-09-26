"use server";

import { uploadMultipleToCloudinary } from "@/lib/cloudinary-uploader/subir-varios";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { validarArchivoImagen } from "@/lib/validar-imagen";

export async function uploadBarberImages(
  files: File[],
  folder?: string
): Promise<{ success: boolean; images: string[]; error?: string }> {
  const contexto = await requerirPanel();
  if (!contexto) return { success: false, images: [], error: "No autorizado" };

  if (!Array.isArray(files) || files.length === 0 || !files.every((file) => file instanceof File)) {
    return { success: false, images: [], error: "No se recibieron imágenes válidas" };
  }

  const finalFolder = folder ?? "barberia/barberos";
  if (contexto.rol === "EMPLEADO" && finalFolder !== "barberia/barberos") {
    return { success: false, images: [], error: "No autorizado" };
  }

  // Validamos cada archivo antes de subirlo
  for (const archivo of files) {
    const validacion = await validarArchivoImagen(archivo);

    if (!validacion.ok) {
      return { success: false, images: [], error: validacion.error };
    }
  }

  // Subida múltiple con opciones comunes
  const results = await uploadMultipleToCloudinary(files, {
    folder: finalFolder,
    resourceType: "image",
  });

  // Extraemos solo las URLs exitosas
  const images = results.flatMap((resultado) =>
    resultado.success && typeof resultado.url === "string" ? [resultado.url] : [],
  );

  if (images.length !== files.length) {
    return { success: false, images, error: "No se pudieron subir todas las imágenes" };
  }

  return {
    success: true,
    images,
  };
}
