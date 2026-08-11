import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO } from "@/lib/constants";

export async function obtenerBarberosConRendimientoHoy(inicioDia: Date, finDia: Date) {
  return prisma.barbero.findMany({
    where: { estado: true },
    select: {
      id: true,
      nombre: true,
      turnos: {
        where: {
          horarioReservado: { gte: inicioDia, lte: finDia },
          estado: ESTADOS_TURNO[2],
        },
        select: { precioCongelado: true },
      },
    },
    orderBy: { nombre: "asc" },
  });
}
