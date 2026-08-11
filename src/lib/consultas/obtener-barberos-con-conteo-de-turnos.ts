import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO_ACTIVOS } from "@/lib/constants";

export async function obtenerBarberosConConteoDeTurnos() {
  return prisma.barbero.findMany({
    where: { estado: true },
    select: {
      id: true,
      nombre: true,
      srcImage: true,
      _count: {
        select: {
          turnos: { where: { estado: { in: [...ESTADOS_TURNO_ACTIVOS] } } },
        },
      },
    },
    orderBy: { nombre: "asc" },
    take: 5,
  });
}
