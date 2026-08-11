"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function softDeleteExcepcionBase(
  formData: FormData
): Promise<void> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("ID requerido");
    }

    await prisma.excepcion_laboral.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/excepcionesLaborales");

  } catch (error) {
    console.error("Error al desactivar excepción:", error);
  }
}

export const softDeleteExcepcion = exigirAdmin(softDeleteExcepcionBase);
