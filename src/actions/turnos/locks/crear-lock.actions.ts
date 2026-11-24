"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { TTL_LOCK_SLOT_MS } from "@/lib/constants";
import { ejecutarConBloqueReserva } from "@/lib/turnos/ejecutar-con-bloque-reserva";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";

export async function crearLockSlot(
  barberoId: string,
  slot: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sesion = await requerirSesion();
    if (!sesion) return { success: false, error: "No autorizado" };

    if (!barberoId || !slot || !sessionId) {
      return { success: false, error: "Faltan campos" };
    }

    const horarioReservado = new Date(slot);
    if (isNaN(horarioReservado.getTime())) {
      return { success: false, error: "Horario inválido" };
    }

    const { id: userId } = sesion.user;
    const creado = await prisma.$transaction((tx) => ejecutarConBloqueReserva(tx, barberoId, async () => {
      const ahora = new Date();
      await tx.slotLock.deleteMany({ where: { userId } });

      const lockAjeno = await tx.slotLock.findFirst({
        where: { barberoId, horarioReservado, expiresAt: { gt: ahora }, userId: { not: userId } },
        select: { id: true },
      });
      if (lockAjeno) return false;

      await tx.slotLock.create({
        data: {
          barberoId,
          horarioReservado,
          userId,
          sessionId,
          expiresAt: new Date(ahora.getTime() + TTL_LOCK_SLOT_MS),
        },
      });
      return true;
    }));
    if (!creado) return { success: false, error: "Otro usuario ya seleccionó este horario" };

    revalidateTag(`locks-${barberoId}-${obtenerFechaSola(horarioReservado)}`);

    return { success: true };
  } catch {
    return { success: false, error: "Error interno" };
  }
}
