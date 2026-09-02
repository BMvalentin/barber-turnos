"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { TTL_LOCK_SLOT_MS } from "@/lib/constants";
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

    const expiresAt = new Date(Date.now() + TTL_LOCK_SLOT_MS);

    // Eliminar lock anterior de este usuario (cambió de slot)
    await prisma.slotLock.deleteMany({ where: { userId: sesion.user.id } });

    await prisma.slotLock.create({
      data: {
        barberoId,
        horarioReservado,
        userId: sesion.user.id,
        sessionId,
        expiresAt,
      },
    });

    revalidateTag(`locks-${barberoId}-${obtenerFechaSola(horarioReservado)}`);

    return { success: true };
  } catch {
    return { success: false, error: "Error interno" };
  }
}
