"use server";

import { uploadToCloudinary } from "./subir-uno";
import type { UploadSingleOptions, UploadResult } from "./tipos";

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
