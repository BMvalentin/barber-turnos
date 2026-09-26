"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { ESTADOS_TURNO } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type { TurnoResumen } from "@/types/turno";

export async function completedTurno(
  prevState: ActionState<TurnoResumen>,
  formData: FormData,
): Promise<ActionState<TurnoResumen>> {
  try {
    const id = formData.get("id");
    if (typeof id !== "string" || !id) return { success: false, error: "ID inválido" };

    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const turno = await prisma.turno.update({
      where: { id, estado: ESTADOS_TURNO[1] },
      data: { estado: ESTADOS_TURNO[2], claveSlot: null },
    });

    revalidateTag("turnos-global");
    revalidateTag(`turnos-user-${turno.userId}`);
    revalidatePath("/admin");
    revalidatePath("/turno");

    return {
      success: true,
      data: {
        ...turno,
        precioCongelado: Number(turno.precioCongelado),
        seniaCongelada: Number(turno.seniaCongelada),
      },
    };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return { success: false, error: "El turno no existe o no está confirmado" };
    }
    console.error(error);
    return { success: false, error: "Error al completar turno" };
  }
}
