"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/action-state";
import { requerirAdmin } from "@/lib/seguridad";

export async function asignarHorarioABarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const barberoId = formData.get("barberoId");
    const margenLaboralId = formData.get("margenLaboralId");

    if (!barberoId || !margenLaboralId) {
      return { success: false, error: "Datos incompletos" };
    }

    const margen = await prisma.margen_laboral.findUnique({
      where: { id: String(margenLaboralId) },
    });

    if (!margen) {
      return { success: false, error: "Horario no encontrado" };
    }

    await prisma.margen_laboral_barbero.create({
      data: {
        barberoId: String(barberoId),
        margenLaboralId: margen.id,
        diaId: margen.diaId,
      },
    });

    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al asignar horario:", error);
    return { success: false, error: "Error al asignar horario" };
  }
}