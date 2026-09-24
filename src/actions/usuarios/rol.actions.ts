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
  barberoId: z.string().min(1).nullable(),
});

export async function actualizarRolUsuario(
  userId: string,
  role: RolUsuario,
  barberoId: string | null,
): Promise<ActionState> {
  try {
    const sesionAdmin = await requerirAdmin();
    if (!sesionAdmin) return { success: false, error: "No autorizado" };

    const parsed = esquemaCambioRol.safeParse({ userId, role, barberoId });
    if (!parsed.success) return { success: false, error: "Datos de rol inválidos" };
    if (parsed.data.role === "EMPLEADO" && !parsed.data.barberoId) {
      return { success: false, error: "Seleccioná el barbero asociado al empleado" };
    }

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
      const barberoActual = await tx.barbero.findFirst({
        where: { usuarioId: parsed.data.userId },
        select: { id: true },
      });

      if (parsed.data.role === "EMPLEADO" || parsed.data.role === "ADMIN") {
        if (parsed.data.role === "EMPLEADO" && !parsed.data.barberoId) {
          throw new Error("BARBERO_REQUERIDO");
        }

        if (!parsed.data.barberoId) {
          if (barberoActual) {
            await tx.barbero.update({ where: { id: barberoActual.id }, data: { usuarioId: null, email: null } });
          }
        } else {
          const barberoSeleccionado = await tx.barbero.findFirst({
            where: {
              id: parsed.data.barberoId,
              OR: [{ usuarioId: null }, { usuarioId: parsed.data.userId }],
            },
            select: { id: true },
          });
          if (!barberoSeleccionado) throw new Error("BARBERO_NO_DISPONIBLE");

          if (barberoActual && barberoActual.id !== barberoSeleccionado.id) {
            await tx.barbero.update({ where: { id: barberoActual.id }, data: { usuarioId: null, email: null } });
          }
          const cuenta = await tx.user.findUnique({ where: { id: parsed.data.userId }, select: { email: true } });
          await tx.barbero.update({
            where: { id: barberoSeleccionado.id },
            data: { usuarioId: parsed.data.userId, email: cuenta?.email ?? null },
          });
        }
      } else if (barberoActual) {
        await tx.barbero.update({ where: { id: barberoActual.id }, data: { usuarioId: null, email: null } });
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
    if (error instanceof Error && error.message === "BARBERO_NO_DISPONIBLE") {
      return { success: false, error: "El barbero seleccionado ya está asociado a otra cuenta" };
    }
    if (error instanceof Error && error.message === "BARBERO_REQUERIDO") {
      return { success: false, error: "Seleccioná el barbero asociado al empleado" };
    }
    console.error("Error al actualizar el rol del usuario:", error);
    return { success: false, error: "No se pudo actualizar el rol" };
  }
}
