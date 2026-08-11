import { prisma } from "@/lib/prisma";

export async function obtenerServiciosPopulares() {
  return prisma.servicio.findMany({
    where: { estado: true },
    select: {
      id: true,
      nombre: true,
      precio: true,
      _count: { select: { turnos: true } },
    },
    orderBy: { turnos: { _count: "desc" } },
    take: 5,
  });
}
