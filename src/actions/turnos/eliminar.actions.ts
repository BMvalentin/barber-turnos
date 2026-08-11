"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { toZonedTime } from "date-fns-tz";
import { requerirAdmin } from "@/lib/seguridad";
import { enviarEmailTurno } from "@/lib/email";
import { revalidarCacheTurno } from "@/lib/revalidar-turno";
import type { ActionState } from "@/types/action-state";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export async function deleteTurno(prevState: ActionState, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID inválido" };

    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const turnoToDelete = await prisma.turno.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, telefono: true } },
        barbero: true,
        servicio: true,
      },
    });

    if (!turnoToDelete) return { success: false, error: "Turno no encontrado" };

    await prisma.turno.delete({ where: { id } });

    const fecha = toZonedTime(turnoToDelete.horarioReservado, TIMEZONE).toISOString().split("T")[0];
    revalidarCacheTurno(turnoToDelete.barberoId, fecha);
    revalidateTag(`turnos-mes-${turnoToDelete.barberoId}-${fecha.substring(0, 7)}`);
    revalidateTag(`turnos-user-${turnoToDelete.userId}`);

    void enviarEmailTurno(turnoToDelete, "CANCELADO").catch((error) => console.error("Error enviando email de eliminación:", error));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar turno" };
  }
}
