import { MINIMO_ANTICIPACION_MS } from "@/lib/constants";

/** El caché puede conservar slots que vencieron después del cálculo. */
export function filtrarSlotsVigentes(slots: string[], ahora = Date.now()): string[] {
  const limite = ahora + MINIMO_ANTICIPACION_MS;
  return slots.filter((slot) => Date.parse(slot) > limite);
}
