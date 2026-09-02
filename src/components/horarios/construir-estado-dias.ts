import type { BarberoParaHorarios, DiaLaboral } from "@/types/horarios";
import type { EstadoDiaEditor } from "@/components/horarios/TablaDiasBarbero";

export const ESTADO_INICIAL_DIA: EstadoDiaEditor = {
  trabaja: false,
  rangos: [{ desde: "09:00", hasta: "18:00" }],
  asignacionIds: [],
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

    estado[dia.id] =
      asignacionesActivas.length > 0
        ? {
            trabaja: true,
            rangos: asignacionesActivas
              .map((h) => ({ desde: h.margenLaboral.desde, hasta: h.margenLaboral.hasta }))
              .sort((a, b) => a.desde.localeCompare(b.desde)),
            asignacionIds: asignacionesActivas.map((h) => h.id),
          }
        : { ...ESTADO_INICIAL_DIA };

    return estado;
  }, {});
}
