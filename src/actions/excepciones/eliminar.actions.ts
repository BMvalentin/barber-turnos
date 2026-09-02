"use server";

import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { revalidarExcepciones } from "@/lib/revalidar/revalidar-excepciones";

async function softDeleteExcepcionBase(
  formData: FormData
): Promise<void> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("ID requerido");
    }

    const excepcion = await prisma.excepcion_laboral.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidarExcepciones(excepcion.barberoId);

  } catch (error) {
    console.error("Error al desactivar excepción:", error);
  }
}

export const softDeleteExcepcion = exigirAdmin(softDeleteExcepcionBase);
