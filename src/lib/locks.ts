import { prisma } from "@/lib/prisma";

export async function existeLockAjeno(
  barberoId: string,
  horario: Date,
  userIdExcluido: string,
): Promise<boolean> {
  const lock = await prisma.slotLock.findFirst({
    where: {
      barberoId,
      horarioReservado: horario,
      expiresAt: { gt: new Date() },
      NOT: { userId: userIdExcluido },
    },
  });
  return lock !== null;
}
