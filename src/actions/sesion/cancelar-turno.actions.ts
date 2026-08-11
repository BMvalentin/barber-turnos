"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { ESTADOS_TURNO } from "@/lib/constants";
import { actualizarTurnoConDetalle } from "@/lib/turno-con-detalle";
import type { ActionState } from "@/types/action-state";

export async function cancelTurno(turnoId: string): Promise<ActionState> {
  try {
    // Solo el dueño del turno (o un admin) puede cancelarlo
    const sesion = await requerirSesion();
    if (!sesion) return { success: false, error: "No autorizado" };

    const turnoExistente = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: { userId: true },
    });
    if (!turnoExistente) {
      return { success: false, error: "No se pudo cancelar el turno" };
    }

    const sesionAdmin = await requerirAdmin();
    if (!sesionAdmin && turnoExistente.userId !== sesion.user.id) {
      return { success: false, error: "No autorizado" };
    }

    const turnoActualizado = await actualizarTurnoConDetalle(turnoId, { estado: ESTADOS_TURNO[3] });

    enviarEmailTurnoSeguro(turnoActualizado, ESTADOS_TURNO[3]);

    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: "No se pudo cancelar el turno" };
  }
}
