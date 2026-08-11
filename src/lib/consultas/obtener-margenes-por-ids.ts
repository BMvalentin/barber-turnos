import { prisma } from "@/lib/prisma";

export async function obtenerMargenesPorIds(ids: string[]) {
  return prisma.margen_laboral.findMany({
    where: { id: { in: ids } },
  });
}
