import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

export async function actualizarTurnoConDetalle(id: string, data: Prisma.turnoUpdateInput | Prisma.turnoUncheckedUpdateInput) {
  return prisma.turno.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, telefono: true } },
      barbero: true,
      servicio: true,
    },
  });
}
