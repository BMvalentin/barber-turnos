import { MINIMO_ANTICIPACION_MS } from "@/lib/constants";

/** Cada inicio indica los minutos consecutivos que admite en la agenda. */
export type CapacidadHoraria = Record<string, [inicio: number, minutosDisponibles: number][]>;

export const MAX_BARBEROS_POR_CONSULTA = 6;
export const VIGENCIA_CACHE_TURNOS_MS = 15 * 60_000;

export function filtrarHorariosPorDuracion(capacidad: CapacidadHoraria, duracion: number, ahora = Date.now()) {
  const limite = ahora + MINIMO_ANTICIPACION_MS;
  const horarios: Record<string, string[]> = {};

  for (const [dia, candidatos] of Object.entries(capacidad)) {
    horarios[dia] = candidatos
      .filter(([inicio, minutos]) => inicio > limite && minutos >= duracion)
      .map(([inicio]) => new Date(inicio).toISOString());
  }

  return horarios;
}
