export function calcularGananciaEmpleado(importeCompletado: number, porcentaje: number): number {
  // La comisión se calcula con el porcentaje vigente sobre servicios completados.
  const porcentajeValido = Number.isFinite(porcentaje) ? Math.min(Math.max(porcentaje, 0), 100) : 0;
  return Math.round(importeCompletado * porcentajeValido / 100);
}
