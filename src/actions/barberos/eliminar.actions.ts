"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function deleteBarberoBase(formData: FormData): Promise<void> {
  try {
    const id = formData.get("id");

    if (!id || typeof id !== "string") {
      throw new Error("ID inválido");
    }

    await prisma.barbero.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidarBarberos();
  } catch (error) {
    console.error("Error al eliminar barbero:", error);
  }
}

export const deleteBarbero = exigirAdmin(deleteBarberoBase);