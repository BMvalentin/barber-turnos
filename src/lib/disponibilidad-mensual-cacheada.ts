import { getCachedData } from "@/lib/cache";
import { obtenerCapacidadHoraria } from "@/lib/disponibilidad";

export function calcularCapacidadMensual(mes: string, barberoId: string, turnoIdAExcluir?: string) {
  const [anio, numeroMes] = mes.split("-").map(Number);
  const ultimoDia = new Date(anio, numeroMes, 0).getDate();
  return obtenerCapacidadHoraria(
    barberoId,
    `${mes}-01`,
    `${mes}-${String(ultimoDia).padStart(2, "0")}`,
    turnoIdAExcluir,
  );
}

/** Reutiliza la agenda del barbero para todas las duraciones de servicio. */
export function obtenerCapacidadMensualCacheada(
  mes: string,
  barberoId: string,
  turnoIdAExcluir?: string,
) {
  return getCachedData(
    ["capacidad-mensual-v1", mes, barberoId, turnoIdAExcluir ?? ""],
    [
      `turnos-mes-${barberoId}-${mes}`,
      `margenes-${barberoId}`,
      `excepciones-${barberoId}`,
      "excepciones-globales",
      "barberos",
      "servicios",
      "turnos-global",
    ],
    () => calcularCapacidadMensual(mes, barberoId, turnoIdAExcluir),
    120,
  );
}
