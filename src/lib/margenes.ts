import type { margen_laboral } from "../../generated/prisma/client";

export function entraEnMargen(
  margenes: margen_laboral[],
  minInicio: number,
  minFin: number,
): boolean {
  return margenes.some((m) => {
    const [hDesde, mDesde] = m.desde.split(":").map(Number);
    const [hHasta, mHasta] = m.hasta.split(":").map(Number);
    const desdeMin = hDesde * 60 + mDesde;
    const hastaMin = hHasta * 60 + mHasta;
    return minInicio >= desdeMin && minFin <= hastaMin;
  });
}
