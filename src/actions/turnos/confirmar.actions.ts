"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { ESTADOS_TURNO } from "@/lib/constants";

export const confirmarTurno = exigirAdmin(async (turnoId: string) => {
  try {
    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: ESTADOS_TURNO[1] },
    });
    revalidatePath("/turno"); // Refresca la página para ver el cambio
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo confirmar el turno" };
  }
});
