"use server";

import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { revalidarExcepciones } from "@/lib/revalidar/revalidar-excepciones";
import type { ActionState } from "@/types/action-state";

async function softDeleteExcepcionBase(
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id");

    if (typeof id !== "string" || !id) return { success: false, error: "ID de cierre inválido" };

    const excepcion = await prisma.excepcion_laboral.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidarExcepciones(excepcion.barberoId);
    return { success: true };

  } catch (error) {
    console.error("Error al desactivar excepción:", error instanceof Error ? error.name : "Error desconocido");
    return { success: false, error: "No se pudo eliminar el cierre" };
  }
}

export const softDeleteExcepcion = exigirAdmin(softDeleteExcepcionBase);
