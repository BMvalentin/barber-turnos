"use server";

import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import type { ActionState } from "@/types/action-state";
import type { DatosEstadoPago } from "@/types/mercadopago";

/** Verifica el estado del pago de un turno desde el cliente. */
export async function verificarEstadoPago(turnoId: string): Promise<ActionState<DatosEstadoPago>> {
  try {
    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "No autorizado" };

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: {
        id: true,
        userId: true,
        estado: true,
        seniaCongelada: true,
        mpPaymentId: true,
        mpPreferenceId: true,
      },
    });
    if (!turno) return { success: false, error: "Turno no encontrado" };

    const sesionAutorizada = await requerirPropietarioOAdmin(turno.userId);
    if (!sesionAutorizada) return { success: false, error: "No autorizado" };

    return {
      success: true,
      data: {
        id: turno.id,
        estado: turno.estado,
        seniaCongelada: Number(turno.seniaCongelada),
        mpPaymentId: turno.mpPaymentId ?? null,
        mpPreferenceId: turno.mpPreferenceId ?? null,
      },
    };
  } catch (error) {
    console.error("Error al verificar el estado del pago:", error instanceof Error ? error.message : String(error));
    return { success: false, error: "Error al verificar el pago" };
  }
}
