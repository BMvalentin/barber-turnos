"use server";

import { revalidarDiasLaborales } from "@/lib/revalidar/revalidar-dias-laborales";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

import type { ActionState } from "@/types/action-state";

async function deleteDiaLaboralBase(id: string): Promise<ActionState<{ message: string }>> {
  try {
    // Verificar si existe y tiene márgenes
    const existing = await prisma.dia_laboral.findUnique({
      where: { id },
      include: {
        margenes: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Día laboral no encontrado",
      };
    }

    if (existing.margenes.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar. El día tiene márgenes asociados",
      };
    }

    await prisma.dia_laboral.delete({
      where: { id },
    });

    revalidarDiasLaborales();

    return {
      success: true,
      data: { message: "Día laboral eliminado correctamente" },
    };
  } catch (error) {
    console.error("Error al eliminar día laboral:", error);
    return {
      success: false,
      error: "Error al eliminar el día laboral",
    };
  }
}

export const deleteDiaLaboral = exigirAdmin(deleteDiaLaboralBase);
