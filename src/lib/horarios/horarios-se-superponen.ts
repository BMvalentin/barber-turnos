import { compararHoras } from "@/lib/horarios/comparar-horas";

/**
 * Verifica si dos rangos de horarios se solapan
 */
export function horariosSeSuperponen(
  desde1: string,
  hasta1: string,
  desde2: string,
  hasta2: string
): boolean {
  // No se superponen si:
  // - hasta1 <= desde2 (rango 1 termina antes que empiece rango 2)
  // - hasta2 <= desde1 (rango 2 termina antes que empiece rango 1)

  const hasta1LeDesde2 = compararHoras(hasta1, desde2) <= 0;
  const hasta2LeDesde1 = compararHoras(hasta2, desde1) <= 0;

  return !(hasta1LeDesde2 || hasta2LeDesde1);
}
