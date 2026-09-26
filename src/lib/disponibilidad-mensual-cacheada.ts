import { getCachedData } from "@/lib/cache";
import { obtenerDisponibilidad } from "@/lib/disponibilidad";

/** Conserva el cálculo del mes para los días y horarios del calendario. */
export function obtenerDisponibilidadMensualCacheada(
  mes: string,
  servicioId: string,
  barberoId: string,
  turnoIdAExcluir?: string,
): Promise<Record<string, string[]>> {
  const [anio, numeroMes] = mes.split("-").map(Number);
  const ultimoDia = new Date(anio, numeroMes, 0).getDate();

  return getCachedData(
    ["disponibilidad-mensual", mes, servicioId, barberoId, turnoIdAExcluir ?? "none"],
    [
      `turnos-mes-${barberoId}-${mes}`,
      `servicio-${servicioId}`,
      `margenes-${barberoId}`,
      `excepciones-${barberoId}`,
      "excepciones-globales",
      "turnos-global",
    ],
    () => obtenerDisponibilidad(
      servicioId,
      barberoId,
      `${mes}-01`,
      `${mes}-${String(ultimoDia).padStart(2, "0")}`,
      turnoIdAExcluir,
    ),
    120,
  );
}
