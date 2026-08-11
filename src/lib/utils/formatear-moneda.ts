const LOCALIZACION_ES_AR = "es-AR";

export function formatearMoneda(n: number): string {
  return n.toLocaleString(LOCALIZACION_ES_AR);
}
