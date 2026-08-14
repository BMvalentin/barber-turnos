import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO_ACTIVOS } from "@/lib/constants";

export async function obtenerBarberosConTurnosHoy(inicioDia: Date, finDia: Date) {
  return prisma.barbero.findMany({
    where: { estado: true },
    include: {
      turnos: {
        where: {
          horarioReservado: { gte: inicioDia, lte: finDia },
          estado: { in: [...ESTADOS_TURNO_ACTIVOS] },
        },
        include: {
          user: { select: { name: true, email: true } },
          servicio: { select: { nombre: true, duracion: true } },
        },
        orderBy: { horarioReservado: "asc" },
      },
    },
    orderBy: { nombre: "asc" },
  });
}
