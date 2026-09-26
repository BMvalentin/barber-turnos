"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import type { ActionState } from "@/types/action-state";
import { z } from "zod";

type DatosPerfilActualizado = {
  name: string | null;
  telefono: string | null;
};

const esquemaPerfil = z.object({
  name: z.string().trim().max(100),
  telefono: z.string().trim().regex(/^\+?[0-9][0-9\s().-]{5,31}$/),
});

export async function updateProfile(
  userId: string,
  formData: FormData
): Promise<ActionState<DatosPerfilActualizado>> {
  if (!userId) {
    return { success: false, error: "ID de usuario no encontrado" };
  }

  // Solo el propio usuario (o un admin) puede editar su perfil
  const sesionAutorizada = await requerirPropietarioOAdmin(userId);
  if (!sesionAutorizada) {
    return { success: false, error: "No autorizado" };
  }

  const perfil = esquemaPerfil.safeParse({
    name: formData.get("name"),
    telefono: formData.get("telefono"),
  });
  if (!perfil.success) return { success: false, error: "Ingresá un teléfono válido" };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: perfil.data.name,
        telefono: perfil.data.telefono,
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
