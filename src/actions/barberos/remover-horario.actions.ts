"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { ActionState } from "@/types/action-state";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function removerHorarioDeBarberoBase(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id");

    if (!id) {
      return { success: false, error: "ID requerido" };
    }

    await prisma.margen_laboral_barbero.delete({
      where: { id: String(id) },
    });

    revalidarBarberos();

    return { success: true };
  } catch (error) {
    console.error("Error al remover horario:", error);
    return { success: false, error: "Error al remover horario" };
  }
}

export const removerHorarioDeBarbero = exigirAdmin(removerHorarioDeBarberoBase);