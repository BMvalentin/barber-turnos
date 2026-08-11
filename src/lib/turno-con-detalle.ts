import { prisma } from "@/lib/prisma";
import { SELECCION_USUARIO_BASICA } from "@/lib/constants";
import type { Prisma } from "../../generated/prisma/client";

export const INCLUDE_TURNO_CON_DETALLE = {
  user: { select: SELECCION_USUARIO_BASICA },
  barbero: true,
  servicio: true,
};

export async function actualizarTurnoConDetalle(id: string, data: Prisma.turnoUpdateInput | Prisma.turnoUncheckedUpdateInput) {
  return prisma.turno.update({
    where: { id },
    data,
    include: INCLUDE_TURNO_CON_DETALLE,
  });
}
