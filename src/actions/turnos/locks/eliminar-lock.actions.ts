"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";

export async function eliminarLockSlot(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sesion = await requerirSesion();
    if (!sesion) return { success: false, error: "No autorizado" };

    if (!sessionId) {
      return { success: false, error: "Falta sessionId" };
    }

    // Se consulta ANTES de borrar para saber qué tag revalidar
    const lock = await prisma.slotLock.findFirst({
      where: { sessionId, userId: sesion.user.id },
      select: { barberoId: true, horarioReservado: true },
    });

    await prisma.slotLock.deleteMany({
      where: { sessionId, userId: sesion.user.id },
    });

    if (lock) {
      revalidateTag(`locks-${lock.barberoId}-${obtenerFechaSola(lock.horarioReservado)}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error interno" };
  }
}
