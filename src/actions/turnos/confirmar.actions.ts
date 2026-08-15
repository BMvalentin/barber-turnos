"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { ESTADOS_TURNO } from "@/lib/constants";
import { enviarEmailsTurnoConfirmado } from "@/lib/email/enviar-emails-turno-confirmado";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";

export const confirmarTurno = exigirAdmin(async (turnoId: string) => {
  try {
    const turnoPrevio = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: { id: true, estado: true },
    });
    if (!turnoPrevio) return { success: false, error: "No se pudo confirmar el turno" };

    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: ESTADOS_TURNO[1] },
    });

    if (turnoPrevio.estado === ESTADOS_TURNO[1]) {
      revalidatePath("/turno");
      return { success: true };
    }

    const turnoConfirmado = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: INCLUDE_TURNO_CON_DETALLE,
    });
    if (turnoConfirmado) {
      enviarEmailsTurnoConfirmado(turnoConfirmado);
    }

    revalidatePath("/turno"); // Refresca la página para ver el cambio
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo confirmar el turno" };
  }
});
