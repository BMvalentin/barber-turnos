export function obtenerAmbitoBaseDatosLocal(): string {
  return typeof document === "undefined"
    ? "sin-base"
    : document.documentElement.dataset.ambitoBaseDatos ?? "sin-base";
}
