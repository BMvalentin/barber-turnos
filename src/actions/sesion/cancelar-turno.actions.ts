"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import {
  actualizarTurnoConDetalle,
  INCLUDE_TURNO_CON_DETALLE,
} from "@/lib/turno-con-detalle";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state";

export async function cancelTurno(turnoId: string): Promise<ActionState> {
  try {
    // Solo el dueño del turno (o un admin) puede cancelarlo
    const sesion = await requerirSesion();
    if (!sesion) return { success: false, error: "No autorizado" };

    const turnoExistente = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: { userId: true, horarioReservado: true },
    });
    if (!turnoExistente) {
      return { success: false, error: "No se pudo cancelar el turno" };
    }

    const sesionAdmin = await requerirAdmin();
    if (!sesionAdmin && turnoExistente.userId !== sesion.user.id) {
      return { success: false, error: "No autorizado" };
    }

    const ahora = new Date();
    if (!sesionAdmin && turnoExistente.horarioReservado <= ahora) {
      return {
        success: false,
        error: "No se puede cancelar un turno después de su hora de inicio.",
      };
    }

    const datosCancelacion = {
      estado: ESTADOS_TURNO[3],
      estadoPago: ESTADOS_PAGO[4],
      claveSlot: null,
    };

    const turnoActualizado = sesionAdmin
      ? await actualizarTurnoConDetalle(turnoId, datosCancelacion)
      : await prisma.$transaction(async (tx) => {
          const actualizacion = await tx.turno.updateMany({
            where: {
              id: turnoId,
              userId: sesion.user.id,
              horarioReservado: { gt: ahora },
            },
            data: datosCancelacion,
          });

          if (actualizacion.count === 0) return null;

          return tx.turno.findUnique({
            where: { id: turnoId },
            include: INCLUDE_TURNO_CON_DETALLE,
          });
        });

    if (!turnoActualizado) {
      return {
        success: false,
        error: "No se puede cancelar un turno después de su hora de inicio.",
      };
    }

    enviarEmailTurnoSeguro(turnoActualizado, ESTADOS_TURNO[3]);

    revalidarCacheTurno(
      turnoActualizado.barberoId,
      obtenerFechaSola(turnoActualizado.horarioReservado),
      turnoActualizado.userId,
    );

    revalidatePath("/dashboard");
    revalidatePath("/admin/turno");
    revalidatePath("/admin");

    return { success: true };
  } catch {
    return { success: false, error: "No se pudo cancelar el turno" };
  }
}
