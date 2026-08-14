import { prisma } from "@/lib/prisma";

export async function obtenerServicioPorId(id: string) {
  return prisma.servicio.findUnique({ where: { id } });
}
