import { prisma } from "@/lib/prisma";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { MAP_DIA_SEMANA } from "@/lib/constants";
import type { dias_laborales } from "../../generated/prisma/client";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export async function obtenerContextoDeReserva(
  barberoId: string,
  diaSemana: number,
  inicio: Date,
  fin: Date,
) {
  const fechaSolo = toZonedTime(inicio, TIMEZONE).toISOString().split("T")[0];
  const inicioDia = fromZonedTime(`${fechaSolo}T00:00:00`, TIMEZONE);
  const finDia = fromZonedTime(`${fechaSolo}T23:59:59`, TIMEZONE);

  const [diaLaboral, excepciones, turnosDelDia] = await Promise.all([
    prisma.dia_laboral.findFirst({
      where: { dia: MAP_DIA_SEMANA[diaSemana] as dias_laborales, estado: true },
      include: { margenes: { where: { estado: true } } },
    }),
    prisma.excepcion_laboral.findMany({
      where: { estado: true, desde: { lte: fin }, hasta: { gte: inicio } },
    }),
    prisma.turno.findMany({
      where: {
        barberoId,
        estado: { in: ["PENDIENTE", "CONFIRMADO"] },
        horarioReservado: { gte: inicioDia, lte: finDia },
      },
      include: { servicio: { select: { duracion: true } } },
    }),
  ]);

  return { diaLaboral, excepciones, turnosDelDia };
}
