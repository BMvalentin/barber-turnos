import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO, ESTADOS_TURNO_ACTIVOS } from "@/lib/constants";

export async function obtenerBarberosConTurnosHoy(inicioDia: Date, finDia: Date, barberoId?: string) {
  return prisma.barbero.findMany({
    where: { estado: true, ...(barberoId ? { id: barberoId } : {}) },
    select: {
      id: true,
      nombre: true,
      _count: {
        select: {
          turnos: { where: { estado: { in: [...ESTADOS_TURNO_ACTIVOS] } } },
        },
      },
      turnos: {
        where: {
          horarioReservado: { gte: inicioDia, lte: finDia },
          estado: {
            in: [...ESTADOS_TURNO_ACTIVOS, ESTADOS_TURNO[2]],
          },
        },
        select: {
          id: true,
          estado: true,
          horarioReservado: true,
          precioCongelado: true,
          user: { select: { name: true, email: true } },
          servicio: { select: { nombre: true } },
        },
        orderBy: { horarioReservado: "asc" },
      },
    },
    orderBy: { nombre: "asc" },
  });
}
