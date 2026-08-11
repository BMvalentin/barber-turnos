"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { ActionState } from "@/types/action-state";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function removerServicioDeBarberoBase(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const barberoId = formData.get("barberoId");
    const servicioId = formData.get("servicioId");

    await prisma.servicioxbarbero.deleteMany({
      where: {
        barberoId: String(barberoId),
        servicioId: String(servicioId),
      },
    });

    revalidarBarberos();

    return { success: true };
  } catch (error) {
    console.error("Error al remover servicio:", error);
    return { success: false, error: "Error al remover servicio" };
  }
}

export const removerServicioDeBarbero = exigirAdmin(removerServicioDeBarberoBase);