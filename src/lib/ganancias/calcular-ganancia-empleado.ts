/* Cálculo de la ganancia del empleado sobre sus servicios completados.
   La comisión es la misma para todos los servicios: se aplica el porcentaje
   configurado en el barbero al precio congelado de cada turno. */

export type GananciaEmpleado = {
  completados: number;
  recaudado: number;
  porcentajeGanancia: number;
  ganancia: number;
};

/* Los montos llegan como Decimal de Prisma, o como string si pasaron por la
   caché de Next (serializa a JSON). Se validan en lugar de asumir su forma. */
function aNumero(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor === "string" || (typeof valor === "object" && valor !== null)) {
    const numero = Number(String(valor));
    return Number.isFinite(numero) ? numero : null;
  }
  return null;
}

export function calcularGananciaEmpleado(
  precios: unknown[],
  porcentaje: unknown,
): GananciaEmpleado {
  const porcentajeLeido = aNumero(porcentaje);
  if (porcentajeLeido === null) {
    console.error("Porcentaje de ganancia inválido; se usa 0%.");
  }
  const porcentajeGanancia = Math.min(Math.max(porcentajeLeido ?? 0, 0), 100);

  // Se opera en centavos enteros para no acumular errores de punto flotante.
  const recaudadoCentavos = precios.reduce<number>(
    (total, precio) => total + Math.round((aNumero(precio) ?? 0) * 100),
    0,
  );
  const gananciaCentavos = Math.round((recaudadoCentavos * porcentajeGanancia) / 100);

  return {
    completados: precios.length,
    recaudado: recaudadoCentavos / 100,
    porcentajeGanancia,
    ganancia: gananciaCentavos / 100,
  };
}
