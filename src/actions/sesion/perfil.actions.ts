"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import type { ActionState } from "@/types/action-state";

type DatosPerfilActualizado = {
  name: string | null;
  telefono: string | null;
};

export async function updateProfile(
  userId: string,
  formData: FormData
): Promise<ActionState<DatosPerfilActualizado>> {
  const name = formData.get("name") as string;
  let telefono = formData.get("telefono") as string;

  if (!userId) {
    return { success: false, error: "ID de usuario no encontrado" };
  }

  // Solo el propio usuario (o un admin) puede editar su perfil
  const sesionAutorizada = await requerirPropietarioOAdmin(userId);
  if (!sesionAutorizada) {
    return { success: false, error: "No autorizado" };
  }

  if (!telefono || telefono.trim() === "") {
    return { success: false, error: "El teléfono es obligatorio" };
  }

  telefono = telefono.trim();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        telefono,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        name: updatedUser.name,
        telefono: updatedUser.telefono,
      },
    };
  } catch {
    return { success: false, error: "Error en la base de datos" };
  }
}
