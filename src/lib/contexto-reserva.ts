import { prisma } from "@/lib/prisma";
import { MAPA_DIA_SEMANA_DB, ESTADOS_TURNO_ACTIVOS } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";
import type { dias_laborales } from "../../generated/prisma/client";

export async function obtenerContextoDeReserva(
  barberoId: string,
  diaSemana: number,
  inicio: Date,
  fin: Date,
) {
  const fechaSolo = obtenerFechaSola(inicio);
  const { inicio: inicioDia, fin: finDia } = obtenerRangoDelDia(fechaSolo);

  const [diaLaboral, excepciones, turnosDelDia] = await Promise.all([
    prisma.dia_laboral.findFirst({
      where: { dia: MAPA_DIA_SEMANA_DB[diaSemana] as dias_laborales, estado: true },
      include: { margenes: { where: { estado: true } } },
    }),
    prisma.excepcion_laboral.findMany({
      where: { estado: true, desde: { lte: fin }, hasta: { gte: inicio } },
    }),
    prisma.turno.findMany({
      where: {
        barberoId,
        estado: { in: [...ESTADOS_TURNO_ACTIVOS] },
        horarioReservado: { gte: inicioDia, lte: finDia },
      },
      include: { servicio: { select: { duracion: true } } },
    }),
  ]);

  return { diaLaboral, excepciones, turnosDelDia };
}
