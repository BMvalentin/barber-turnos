import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO, MINIMO_ANTICIPACION_MS } from "@/lib/constants";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";

/* Busca un turno PENDIENTE reciente del mismo usuario/barbero/horario para
   evitar dobles reservas (doble submit, refresh o doble checkout). */
export async function obtenerTurnoDuplicado(args: {
  userId: string;
  barberoId: string;
  horarioReservado: Date;
}) {
  return prisma.turno.findFirst({
    where: {
      userId: args.userId,
      barberoId: args.barberoId,
      horarioReservado: args.horarioReservado,
      estado: ESTADOS_TURNO[0] /* PENDIENTE */,
      createdAt: { gte: new Date(Date.now() - MINIMO_ANTICIPACION_MS) },
    },
    include: INCLUDE_TURNO_CON_DETALLE,
    orderBy: { createdAt: "desc" },
  });
}
