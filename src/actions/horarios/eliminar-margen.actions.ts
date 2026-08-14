"use server";

import { revalidarDiasLaborales } from "@/lib/revalidar/revalidar-dias-laborales";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

import type { ActionState } from "@/types/action-state";

async function deleteMargenLaboralBase(id: string): Promise<ActionState<{ message: string }>> {
  try {
    await prisma.margen_laboral.delete({
      where: { id },
    });

    revalidarDiasLaborales();

    return {
      success: true,
      data: { message: "Margen laboral eliminado correctamente" },
    };
  } catch (error) {
    console.error("Error al eliminar margen laboral:", error);
    return {
      success: false,
      error: "Error al eliminar el margen laboral",
    };
  }
}

export const deleteMargenLaboral = exigirAdmin(deleteMargenLaboralBase);
