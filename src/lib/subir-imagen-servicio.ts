import { validarArchivoImagen } from "@/lib/validar-imagen";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary-uploader/subir-varios";

type ResultadoSubidaImagen = { ok: true; url: string } | { ok: false; error: string };

interface OpcionesSubidaImagen {
  mensajeError?: string;
}

export async function subirImagenServicio(
  image: File,
  opciones?: OpcionesSubidaImagen,
): Promise<ResultadoSubidaImagen> {
  const validacion = await validarArchivoImagen(image);

  if (!validacion.ok) {
    return { ok: false, error: validacion.error };
  }

  const upload = await uploadMultipleToCloudinary([image], {
    folder: "barberia/servicios",
    resourceType: "image",
  });

  const uploaded = upload.find((r) => r.success);

  if (!uploaded?.url) {
    return { ok: false, error: opciones?.mensajeError ?? "No se pudo subir la imagen." };
  }

  return { ok: true, url: uploaded.url };
}
