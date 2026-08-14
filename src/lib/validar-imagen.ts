// Validación real de imágenes para uploads: magic bytes + límite de tamaño + rechazo de SVG/HTML.
// La fuente de verdad son los magic bytes; el MIME (file.type) es solo un primer filtro informativo.

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB (margen bajo el bodySizeLimit de 6 MB de server actions)

type ResultadoValidacion = { ok: true } | { ok: false; error: string };

function leerPrimerosBytes(archivo: File, cantidad: number): Promise<Uint8Array> {
  return archivo.slice(0, cantidad).arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

function coincideCon(bytes: Uint8Array, secuencia: number[], offset = 0): boolean {
  if (bytes.length < offset + secuencia.length) return false;
  return secuencia.every((valor, indice) => bytes[offset + indice] === valor);
}

function esFormatoAdmitido(bytes: Uint8Array): boolean {
  if (coincideCon(bytes, [0x89, 0x50, 0x4e, 0x47])) return true; // PNG
  if (coincideCon(bytes, [0xff, 0xd8, 0xff])) return true; // JPEG
  if (coincideCon(bytes, [0x52, 0x49, 0x46, 0x46]) && coincideCon(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return true; // WebP
  if (coincideCon(bytes, [0x47, 0x49, 0x46, 0x38])) return true; // GIF
  if (coincideCon(bytes, [0x42, 0x4d])) return true; // BMP
  if (coincideCon(bytes, [0x66, 0x74, 0x79, 0x70], 4) && (coincideCon(bytes, [0x61, 0x76, 0x69, 0x66], 8) || coincideCon(bytes, [0x61, 0x76, 0x69, 0x73], 8))) return true; // AVIF
  return false;
}

function tieneTextoRechazado(bytes: Uint8Array): boolean {
  const texto = new TextDecoder().decode(bytes).toLowerCase();
  return texto.includes("<svg") || texto.includes("<?xml") || texto.includes("<!doctype") || texto.includes("<html");
}

export async function validarArchivoImagen(archivo: File): Promise<ResultadoValidacion> {
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return { ok: false, error: "La imagen no puede superar los 5 MB." };
  }

  if (!archivo.type.startsWith("image/") || archivo.type === "image/svg+xml" || archivo.type === "text/html") {
    return { ok: false, error: "El archivo debe ser una imagen." };
  }

  const bytes = await leerPrimerosBytes(archivo, 16);

  if (tieneTextoRechazado(bytes)) {
    return { ok: false, error: "Solo se permiten imágenes reales (no SVG ni HTML)." };
  }

  if (!esFormatoAdmitido(bytes)) {
    return { ok: false, error: "El archivo no es una imagen válida." };
  }

  return { ok: true };
}
