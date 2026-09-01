import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

/** Verifica si otro usuario tiene un lock temporal sobre el horario. Acepta un
 * cliente de transacción (`tx`) opcional (default: `prisma`). */
export async function existeLockAjeno(
  barberoId: string,
  horario: Date,
  userIdExcluido: string,
  client: Prisma.TransactionClient = prisma,
): Promise<boolean> {
  const lock = await client.slotLock.findFirst({
    where: {
      barberoId,
      horarioReservado: horario,
      expiresAt: { gt: new Date() },
      NOT: { userId: userIdExcluido },
    },
  });
  return lock !== null;
}
