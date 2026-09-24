"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
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
      select: { id: true, role: true, email: true },
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
      const barberoActual = await tx.barbero.findFirst({
        where: { usuarioId: parsed.data.userId },
        select: { id: true },
      });

      if (parsed.data.role === "EMPLEADO" || parsed.data.role === "ADMIN") {
        const perfilExistente = barberoActual ?? await tx.barbero.findFirst({
          where: { usuarioId: null, email: usuario.email },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });

        if (perfilExistente) {
          await tx.barbero.update({
            where: { id: perfilExistente.id },
            data: { usuarioId: parsed.data.userId, email: usuario.email },
          });
        } else {
          await tx.barbero.create({
            data: {
              nombre: "Sin nombre",
              email: usuario.email,
              usuarioId: parsed.data.userId,
              estado: true,
            },
          });
        }
      } else if (barberoActual) {
        await tx.barbero.update({
          where: { id: barberoActual.id },
          data: { usuarioId: null, email: null, estado: false },
        });
      }

      await tx.user.update({
        where: { id: parsed.data.userId },
        data: { role: parsed.data.role },
      });
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
