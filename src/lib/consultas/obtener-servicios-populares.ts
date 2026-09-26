import { prisma } from "@/lib/prisma";

export async function obtenerServiciosPopulares(barberoId?: string) {
  return prisma.servicio.findMany({
    where: { estado: true, ...(barberoId ? { turnos: { some: { barberoId } } } : {}) },
    select: {
      id: true,
      nombre: true,
      precio: true,
      _count: { select: { turnos: barberoId ? { where: { barberoId } } : true } },
    },
    orderBy: { turnos: { _count: "desc" } },
    take: 5,
  });
}
