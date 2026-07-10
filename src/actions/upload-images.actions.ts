"use server";

import { uploadMultipleToCloudinary } from "@/lib/cloudinary-uploader";

export async function uploadBarberImages(
  files: File[],
  folder?: string
) {
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