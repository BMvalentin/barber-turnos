import { MAX_IMAGENES_SERVICIO } from "./constantes";

/* Una imagen puede venir como URL plana (string) o como objeto de la relación
   de Prisma ({ url }). */
type EntradaImagen = string | { url: string };

/* Registro con la relación `imagenes` de Prisma, la portada `srcImage` y,
   en el caso de datos cacheados, un array de URLs ya normalizado. */
type RegistroImagenes = {
  srcImage?: string | null;
  imagenes?: EntradaImagen[] | undefined;
};

function resolverUrlImagen(entrada: EntradaImagen | undefined): string {
  if (typeof entrada === "string") return entrada;
  return entrada?.url ?? "";
}

/* Devuelve las URLs de las imágenes de un servicio en orden (máx. MAX_IMAGENES_SERVICIO).
   Siempre devuelve un array (nunca undefined):
   - Si hay entradas (URLs planas u objetos), las mapea y filtra vacíos.
   - Si no hay entradas pero existe `srcImage` (datos legados), usa `[srcImage]`.
   - Si no hay nada, devuelve `[]`. */
export function listarUrlImagenesServicio(registro: RegistroImagenes): string[] {
  const entradas = registro.imagenes;

  if (Array.isArray(entradas) && entradas.length > 0) {
    return entradas
      .map(resolverUrlImagen)
      .filter((url) => url && url.trim() !== "")
      .slice(0, MAX_IMAGENES_SERVICIO);
  }

  const portada = registro.srcImage;

  return portada ? [portada] : [];
}
