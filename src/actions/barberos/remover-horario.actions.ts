"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/action-state";
import { requerirAdmin } from "@/lib/seguridad";

export async function removerHorarioDeBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const id = formData.get("id");

    if (!id) {
      return { success: false, error: "ID requerido" };
    }

    await prisma.margen_laboral_barbero.delete({
      where: { id: String(id) },
    });

    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al remover horario:", error);
    return { success: false, error: "Error al remover horario" };
  }
}