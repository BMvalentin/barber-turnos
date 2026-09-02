"use server";

import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { TTL_LOCK_SLOT_MS } from "@/lib/constants";

export async function renovarLockSlot(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sesion = await requerirSesion();
    if (!sesion) return { success: false, error: "No autorizado" };

    if (!sessionId) {
      return { success: false, error: "Falta sessionId" };
    }

    // Renovar no cambia el conjunto de slots: no revalida caché
    await prisma.slotLock.updateMany({
      where: { sessionId, userId: sesion.user.id },
      data: { expiresAt: new Date(Date.now() + TTL_LOCK_SLOT_MS) },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Error interno" };
  }
}
