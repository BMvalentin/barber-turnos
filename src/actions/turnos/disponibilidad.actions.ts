"use server";

import { getCachedData } from "@/lib/cache";
import { obtenerDisponibilidad } from "@/lib/disponibilidad";

export async function obtenerDiasDisponibles(
  mes: string,
  servicioId: string,
  barberoId: string,
  turnoIdAExcluir?: string,
): Promise<{ success: boolean; data?: string[]; error?: string }> {

  const cacheKey = ["dias-disponibles", mes, servicioId, barberoId, turnoIdAExcluir || "none"];
  const cacheTags = [`turnos-mes-${barberoId}-${mes}`, `servicio-${servicioId}`, `margenes-${barberoId}`, `excepciones-${barberoId}`, "turnos-global"];

  const calcularDiasDisponibles = async () => {
    const [anio, numMes] = mes.split("-").map(Number);
    const ultimoDia = new Date(anio, numMes, 0).getDate();
    const disponibilidad = await obtenerDisponibilidad(
      servicioId,
      barberoId,
      `${mes}-01`,
      `${mes}-${ultimoDia.toString().padStart(2, "0")}`,
      turnoIdAExcluir,
    );
    return Object.entries(disponibilidad)
      .filter(([, slots]) => slots.length > 0)
      .map(([fecha]) => fecha);
  };

  try {
    const data = await getCachedData(cacheKey, cacheTags, calcularDiasDisponibles, 60);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al calcular disponibilidad" };
  }
}
