"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { ESTADOS_TURNO, ESTADOS_PAGO } from "@/lib/constants";
import { enviarEmailsTurnoConfirmado } from "@/lib/email/enviar-emails-turno-confirmado";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";

export const confirmarTurno = exigirAdmin(async (turnoId: string) => {
  try {
    if (typeof turnoId !== "string" || !turnoId) {
      return { success: false, error: "ID de turno inválido" };
    }
    const turnoPrevio = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: { id: true, estado: true, tipoPago: true, claveSlot: true, barberoId: true, horarioReservado: true },
    });
    if (!turnoPrevio) return { success: false, error: "No se pudo confirmar el turno" };

    if (turnoPrevio.estado === ESTADOS_TURNO[1]) {
      revalidatePath("/turno");
      return { success: true };
    }
    const claveSlot = `${turnoPrevio.barberoId}|${turnoPrevio.horarioReservado.toISOString()}`;
    const ahora = new Date();
    if (
      turnoPrevio.estado !== ESTADOS_TURNO[0] ||
      turnoPrevio.claveSlot !== claveSlot ||
      turnoPrevio.horarioReservado <= ahora
    ) {
      return { success: false, error: "Este turno ya no admite confirmación" };
    }

    const resultado = await prisma.turno.updateMany({
      where: {
        id: turnoId,
        estado: ESTADOS_TURNO[0],
        claveSlot,
        horarioReservado: { gt: ahora },
        tipoPago: turnoPrevio.tipoPago,
      },
      data: {
        estado: ESTADOS_TURNO[1],
        estadoPago: turnoPrevio.tipoPago === "TOTAL" ? ESTADOS_PAGO[2] : ESTADOS_PAGO[1],
      },
    });

    if (resultado.count === 0) {
      const turnoActual = await prisma.turno.findUnique({
        where: { id: turnoId },
        select: { estado: true },
      });
      if (turnoActual?.estado === ESTADOS_TURNO[1]) {
        revalidatePath("/turno");
        return { success: true };
      }
      return { success: false, error: "Este turno ya no admite confirmación" };
    }

    const turnoConfirmado = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: INCLUDE_TURNO_CON_DETALLE,
    });
    if (turnoConfirmado) {
      enviarEmailsTurnoConfirmado(turnoConfirmado);
    }

    revalidateTag("turnos-global");
    revalidatePath("/turno"); // Refresca la página para ver el cambio
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo confirmar el turno" };
  }
});
