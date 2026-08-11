"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad";

export async function deleteBarbero(formData: FormData): Promise<void> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return;

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

    revalidatePath("/barbero");
  } catch (error) {
    console.error("Error al eliminar barbero:", error);
  }
}