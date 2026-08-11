"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { ActionState } from "@/types/action-state";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function asignarHorarioABarberoBase(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
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

    revalidarBarberos();

    return { success: true };
  } catch (error) {
    console.error("Error al asignar horario:", error);
    return { success: false, error: "Error al asignar horario" };
  }
}

export const asignarHorarioABarbero = exigirAdmin(asignarHorarioABarberoBase);