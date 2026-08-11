/**
 * Compara dos horas en formato HH:mm
 * Retorna: -1 si hora1 < hora2, 0 si son iguales, 1 si hora1 > hora2
 */
export function compararHoras(hora1: string, hora2: string): number {
  const [h1, m1] = hora1.split(":").map(Number);
  const [h2, m2] = hora2.split(":").map(Number);

  const minutos1 = h1 * 60 + m1;
  const minutos2 = h2 * 60 + m2;

  if (minutos1 < minutos2) return -1;
  if (minutos1 > minutos2) return 1;
  return 0;
}
