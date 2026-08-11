"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/action-state";
import { requerirAdmin } from "@/lib/seguridad";

export async function removerServicioDeBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const barberoId = formData.get("barberoId");
    const servicioId = formData.get("servicioId");

    await prisma.servicioxbarbero.deleteMany({
      where: {
        barberoId: String(barberoId),
        servicioId: String(servicioId),
      },
    });

    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al remover servicio:", error);
    return { success: false, error: "Error al remover servicio" };
  }
}