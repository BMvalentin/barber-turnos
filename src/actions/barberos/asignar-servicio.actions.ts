"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { ActionState } from "@/types/action-state";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function asignarServicioABarberoBase(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const barberoId = formData.get("barberoId");
    const servicioId = formData.get("servicioId");

    if (!barberoId || !servicioId) {
      return { success: false, error: "Datos incompletos" };
    }

    await prisma.servicioxbarbero.create({
      data: {
        barberoId: String(barberoId),
        servicioId: String(servicioId),
      },
    });

    revalidarBarberos();

    return { success: true };
  } catch (error) {
    console.error("Error al asignar servicio:", error);
    return { success: false, error: "Error al asignar servicio" };
  }
}

export const asignarServicioABarbero = exigirAdmin(asignarServicioABarberoBase);