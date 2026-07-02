// lib/cloudinary-uploader.ts
"use server";

import cloudinary from "@/lib/cloudinary";

// Tipos
export interface UploadSingleOptions {
  file: File;
  folder?: string;
  publicId?: string;
  transformation?: Record<string, any>[];
  context?: Record<string, string>;
  tags?: string[];
  resourceType?: "image" | "video" | "raw" | "auto";
  format?: string;
  overwrite?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  publicId?: string;
}

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
    const uploadResponse: any = await new Promise((resolve, reject) => {
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
  } catch (error: any) {
    console.error("Error subiendo a Cloudinary:", error);
    return { success: false, error: error.message ?? "Error desconocido" };
  }
}

// Sube MÚLTIPLES archivos (llama a la anterior)
export async function uploadMultipleToCloudinary(
  files: File[],
  commonOptions?: Omit<UploadSingleOptions, "file">,
  perFileOptions?: ((
    file: File,
    index: number
  ) => Partial<UploadSingleOptions>)
): Promise<(UploadResult & { index: number })[]> {
  const results = await Promise.allSettled(
    files.map(async (file, index) => {
      const specific = perFileOptions ? perFileOptions(file, index) : {};
      const options = { file, ...commonOptions, ...specific };
      return { index, ...(await uploadToCloudinary(options)) };
    })
  );

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { index: 0, success: false, error: "upload failed" }
  );
}