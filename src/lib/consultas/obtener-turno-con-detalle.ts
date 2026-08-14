import { prisma } from "@/lib/prisma";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";

export async function obtenerTurnoConDetalle(id: string) {
  return prisma.turno.findUnique({
    where: { id },
    include: INCLUDE_TURNO_CON_DETALLE,
  });
}
