"use server";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";

export async function listarLocksDelDia(
  barberoId: string,
  fecha: string
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const sesion = await requerirSesion();
    if (!sesion) return { success: false, error: "No autorizado" };

    if (!barberoId || !fecha) {
      return { success: false, error: "Faltan parámetros" };
    }

    const { inicio, fin } = obtenerRangoDelDia(fecha);

    // La caché guarda el set COMPLETO (con userIds); el filtrado por usuario
    // autenticado ocurre FUERA del fetcher cacheado.
    const obtenerLocksCacheados = unstable_cache(
      async () => {
        const locks = await prisma.slotLock.findMany({
          where: {
            barberoId,
            horarioReservado: { gte: inicio, lte: fin },
            expiresAt: { gt: new Date() },
          },
          select: { horarioReservado: true, userId: true },
        });
        return locks.map((l) => ({
          slot: l.horarioReservado.toISOString(),
          userId: l.userId,
        }));
      },
      ["locks-dia", barberoId, fecha],
      { tags: [`locks-${barberoId}-${fecha}`], revalidate: 20 }
    );

    const locks = await obtenerLocksCacheados();
    const data = locks
      .filter((l) => l.userId !== sesion.user.id)
      .map((l) => l.slot);

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error interno" };
  }
}
