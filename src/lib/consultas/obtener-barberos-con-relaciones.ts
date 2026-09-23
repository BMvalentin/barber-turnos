import { prisma } from "@/lib/prisma";

export async function obtenerBarberosConRelaciones(barberoId?: string) {
  return prisma.barbero.findMany({
    where: barberoId ? { id: barberoId } : undefined,
    include: {
      servicios: { include: { servicio: true } },
      horarios: { include: { dia: true, margenLaboral: true } },
    },
    orderBy: { nombre: "asc" },
  });
}
