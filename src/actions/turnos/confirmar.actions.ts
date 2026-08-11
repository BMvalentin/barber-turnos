"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad";

export async function confirmarTurno(turnoId: string) {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: "CONFIRMADO" },
    });
    revalidatePath("/turno"); // Refresca la página para ver el cambio
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo confirmar el turno" };
  }
}
