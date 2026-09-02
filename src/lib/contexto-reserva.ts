import { prisma } from "@/lib/prisma";
import { MAPA_DIA_SEMANA_DB, ESTADOS_TURNO_ACTIVOS } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";
import type { Prisma, dias_laborales } from "../../generated/prisma/client";

/**
 * Obtiene el contexto de disponibilidad de un turno. Acepta un cliente de
 * transacción (`tx`) opcional para reutilizar las lecturas dentro de una
 * `$transaction` (default: `prisma`). Las consultas se ejecutan en secuencia
 * porque las transacciones interactivas de Prisma no soportan queries paralelas.
 */
export async function obtenerContextoDeReserva(
  barberoId: string,
  diaSemana: number,
  inicio: Date,
  fin: Date,
  client: Prisma.TransactionClient = prisma,
  turnoIdAExcluir?: string,
) {
  const fechaSolo = obtenerFechaSola(inicio);
  const { inicio: inicioDia, fin: finDia } = obtenerRangoDelDia(fechaSolo);

  const diaLaboral = await client.dia_laboral.findFirst({
    where: { dia: MAPA_DIA_SEMANA_DB[diaSemana] as dias_laborales, estado: true },
    include: { margenes: { where: { estado: true } } },
  });
  const excepciones = await client.excepcion_laboral.findMany({
    where: {
      estado: true,
      desde: { lte: fin },
      hasta: { gte: inicio },
      OR: [{ barberoId }, { barberoId: null }],
    },
  });
  const turnosDelDia = await client.turno.findMany({
    where: {
      barberoId,
      estado: { in: [...ESTADOS_TURNO_ACTIVOS] },
      horarioReservado: { gte: inicioDia, lte: finDia },
      ...(turnoIdAExcluir ? { id: { not: turnoIdAExcluir } } : {}),
    },
    include: { servicio: { select: { duracion: true } } },
  });

  return { diaLaboral, excepciones, turnosDelDia };
}
