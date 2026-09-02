"use server";

import { getCachedData } from "@/lib/cache";
import { obtenerDisponibilidad } from "@/lib/disponibilidad";
import type { ActionState } from "@/types/action-state";

export async function obtenerHorariosDisponibles(
  fecha: string,
  servicioId: string,
  barberoId: string,
  turnoIdAExcluir?: string,
): Promise<ActionState<string[]>> {

  const cacheKey = ["horarios-finales", fecha, servicioId, barberoId, turnoIdAExcluir || "none"];
  const cacheTags = [`turnos-${barberoId}-${fecha}`, `servicio-${servicioId}`, `margenes-${barberoId}`, `excepciones-${barberoId}`, "excepciones-globales", "turnos-global"];

  const calcularSlotsFinales = async () => {
    const disponibilidad = await obtenerDisponibilidad(servicioId, barberoId, fecha, fecha, turnoIdAExcluir);
    return disponibilidad[fecha] ?? [];
  };

  try {
    const data = await getCachedData(cacheKey, cacheTags, calcularSlotsFinales, 120);
    return { success: true, data };
  } catch {
    return { success: false, error: "Error al obtener horarios" };
  }
}
