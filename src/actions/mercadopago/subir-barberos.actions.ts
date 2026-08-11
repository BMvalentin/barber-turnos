"use server";

import { uploadMultipleToCloudinary } from "@/lib/cloudinary-uploader/subir-varios";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { validarArchivoImagen } from "@/lib/validar-imagen";

export async function uploadBarberImages(
  files: File[],
  folder?: string
): Promise<{ success: boolean; images: string[]; error?: string }> {
  const sesion = await requerirAdmin();
  if (!sesion) return { success: false, images: [], error: "No autorizado" };

  const finalFolder = folder ?? "barbers";

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
  const images = results
    .filter((r) => r.success)
    .map((r) => r.url as string);

  return {
    success: true,
    images,
  };
}
