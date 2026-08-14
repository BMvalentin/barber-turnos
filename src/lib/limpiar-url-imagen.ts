// Función helper para limpiar y validar URLs de imágenes.
export function limpiarUrlImagen(url: string | null): string | null {
  if (!url || url.trim() === "") return null;

  let cleaned = url.trim();

  if (cleaned.includes("public\\") || cleaned.includes("public/")) {
    cleaned = cleaned.replace(/^.*public[\\\/]/, "/");
  }

  if (cleaned.match(/^[A-Za-z]:\\/)) {
    console.warn("⚠️ Ruta de Windows detectada, no se guardará:", cleaned);
    return null;
  }

  if (!cleaned.startsWith("http") && !cleaned.startsWith("/")) {
    cleaned = "/" + cleaned;
  }

  cleaned = cleaned.replace(/\\/g, "/");

  return cleaned;
}
