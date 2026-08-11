"use server";

import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import type { UploadSingleOptions, UploadResult } from "./tipos";

// Sube UN SOLO archivo a Cloudinary
export async function uploadToCloudinary({
  file,
  folder = "default",
  publicId,
  transformation = [
    {
      width: 1600,
      crop: "limit",
      quality: "auto:best",
      fetch_format: "auto",
    },
  ],
  context = {},
  tags = [],
  resourceType = "image",
  format,
  overwrite = false,
}: UploadSingleOptions): Promise<UploadResult> {
  try {
    // Convertir File a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar un public_id único si no se provee
    const finalPublicId =
      publicId ?? `${Date.now()}-${crypto.randomUUID()}`;

    // Promisify de upload_stream
    const uploadResponse = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: finalPublicId,
          overwrite,
          resource_type: resourceType,
          format, // opcional
          transformation,
          context,
          tags,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Cloudinary no devolvió resultado"));
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return {
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    console.error("Error subiendo a Cloudinary:", detalle);
    return { success: false, error: detalle || "Error desconocido" };
  }
}
