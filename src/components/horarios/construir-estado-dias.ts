import type { BarberoParaHorarios, DiaLaboral } from "@/types/horarios";
import type { EstadoDiaEditor } from "@/components/horarios/TablaDiasBarbero";

export const ESTADO_INICIAL_DIA: EstadoDiaEditor = {
  trabaja: false,
  desde: "09:00",
  hasta: "18:00",
  rangosExtra: 0,
};

export function construirEstado(
  barberos: BarberoParaHorarios[],
  diasLaborales: DiaLaboral[],
  barberoId: string,
): Record<string, EstadoDiaEditor> {
  const barbero = barberos.find((b) => b.id === barberoId);

  return diasLaborales.reduce<Record<string, EstadoDiaEditor>>((estado, dia) => {
    const asignacionesActivas = (barbero?.horarios ?? []).filter(
      (h) => h.dia.id === dia.id && h.estado === true && h.margenLaboral,
    );

    if (asignacionesActivas.length === 1) {
      const unica = asignacionesActivas[0];
      estado[dia.id] = {
        trabaja: true,
        desde: unica.margenLaboral.desde,
        hasta: unica.margenLaboral.hasta,
        asignacionId: unica.id,
        rangosExtra: 0,
      };
    } else if (asignacionesActivas.length > 1) {
      estado[dia.id] = {
        trabaja: true,
        desde: asignacionesActivas.reduce(
          (minimo, h) => (h.margenLaboral.desde < minimo ? h.margenLaboral.desde : minimo),
          "23:59",
        ),
        hasta: asignacionesActivas.reduce(
          (maximo, h) => (h.margenLaboral.hasta > maximo ? h.margenLaboral.hasta : maximo),
          "00:00",
        ),
        rangosExtra: asignacionesActivas.length - 1,
      };
    } else {
      estado[dia.id] = { ...ESTADO_INICIAL_DIA };
    }

    return estado;
  }, {});
}
