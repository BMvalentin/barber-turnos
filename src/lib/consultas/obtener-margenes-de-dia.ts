import { prisma } from "@/lib/prisma";

export async function obtenerMargenesDeDia(diaId: string, excluirId?: string) {
  return prisma.margen_laboral.findMany({
    where: {
      diaId,
      ...(excluirId ? { id: { not: excluirId } } : {}),
    },
    orderBy: { desde: "asc" },
  });
}
