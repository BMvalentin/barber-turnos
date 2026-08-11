"use server";

import { prisma } from "@/lib/prisma";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { obtenerTurnoConDetalle } from "@/lib/consultas/obtener-turno-con-detalle";
import { ESTADOS_TURNO } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state";

export async function deleteTurno(prevState: ActionState, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID inválido" };

    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const turnoToDelete = await obtenerTurnoConDetalle(id);

    if (!turnoToDelete) return { success: false, error: "Turno no encontrado" };

    await prisma.turno.delete({ where: { id } });

    const fecha = obtenerFechaSola(turnoToDelete.horarioReservado);
    revalidarCacheTurno(turnoToDelete.barberoId, fecha, turnoToDelete.userId);

    enviarEmailTurnoSeguro(turnoToDelete, ESTADOS_TURNO[3]);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar turno" };
  }
}
