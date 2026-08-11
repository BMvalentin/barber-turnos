export function esImagenValida(archivo: File): boolean {
  return archivo.type.startsWith("image/");
}
