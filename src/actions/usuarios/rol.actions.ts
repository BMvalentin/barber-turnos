"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { asegurarPerfilBarbero } from "@/lib/barberos/asegurar-perfil-barbero";
import { revalidatePath } from "next/cache";
import { invalidarCacheRol, requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import { ROLES_USUARIO, type RolUsuario } from "@/types/usuario";
import type { ActionState } from "@/types/action-state";

const esquemaCambioRol = z.object({
  userId: z.string().min(1, "Usuario inválido"),
  role: z.enum(ROLES_USUARIO),
});

export async function actualizarRolUsuario(
  userId: string,
  role: RolUsuario,
): Promise<ActionState> {
  try {
    const sesionAdmin = await requerirAdmin();
    if (!sesionAdmin) return { success: false, error: "No autorizado" };

    const parsed = esquemaCambioRol.safeParse({ userId, role });
    if (!parsed.success) return { success: false, error: "Datos de rol inválidos" };

    const usuario = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, role: true },
    });
    if (!usuario) return { success: false, error: "Usuario no encontrado" };

    if (parsed.data.userId === sesionAdmin.user.id && parsed.data.role !== usuario.role) {
      return { success: false, error: "No podés cambiar tu propio rol" };
    }

    if (usuario.role === "ADMIN" && parsed.data.role !== "ADMIN") {
      const cantidadAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (cantidadAdmins <= 1) {
        return { success: false, error: "Debe quedar al menos un administrador" };
      }
    }

    await prisma.$transaction(async (tx) => {
      const cuenta = await tx.user.update({
        where: { id: usuario.id },
        data: { role: parsed.data.role },
        select: { id: true, email: true },
      });

      if (parsed.data.role === "EMPLEADO" || parsed.data.role === "ADMIN") {
        await asegurarPerfilBarbero(tx, cuenta);
      } else {
        await tx.barbero.updateMany({
          where: { usuarioId: usuario.id },
          // Se conserva el correo para reutilizar este perfil si la cuenta vuelve a ser
          // empleado o administrador, en lugar de crear un perfil duplicado.
          data: { usuarioId: null, estado: false },
        });
      }
    });

    invalidarCacheRol(parsed.data.userId);
    revalidatePath("/admin/usuarios");
    revalidarBarberos();
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);
    return { success: false, error: "No se pudo actualizar el rol" };
  }
}
