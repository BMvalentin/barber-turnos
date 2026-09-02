import type { EstadoDiaEditor } from "@/components/horarios/TablaDiasBarbero";
import { ESTADO_INICIAL_DIA } from "@/components/horarios/construir-estado-dias";
import type { HorarioDiaBarbero } from "@/types/horarios";

export function estadoDesdeDiasGuardados(
  dias: HorarioDiaBarbero[],
  estadoAnterior: Record<string, EstadoDiaEditor>,
): Record<string, EstadoDiaEditor> {
  const resultado: Record<string, EstadoDiaEditor> = {};

  for (const dia of dias) {
    const previo = estadoAnterior[dia.diaId];
    const rangos = dia.trabaja ? dia.rangos : [];
    const mismosRangos =
      !!previo &&
      previo.trabaja === dia.trabaja &&
      rangos.length === previo.rangos.length &&
      rangos.every((r, i) => r.desde === previo.rangos[i].desde && r.hasta === previo.rangos[i].hasta);

    resultado[dia.diaId] = dia.trabaja
      ? {
          trabaja: true,
          rangos,
          asignacionIds: mismosRangos ? previo?.asignacionIds ?? [] : [],
        }
      : { ...ESTADO_INICIAL_DIA };
  }

  return resultado;
}
