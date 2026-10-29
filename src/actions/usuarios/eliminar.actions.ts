"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { invalidarCacheRol, requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { ActionState } from "@/types/action-state";

const esquemaUsuarioId = z.string().min(1, "Usuario inválido");

function codigoError(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const codigo = Reflect.get(error, "code");
  return typeof codigo === "string" ? codigo : null;
}

/* Error de regla de negocio detectado dentro de la transacción. */
class EliminacionRechazadaError extends Error {}

/**
 * Elimina una cuenta. Por integridad del historial (turnos, pagos y ganancias,
 * que se borrarían en cascada) solo se permite sobre cuentas sin turnos.
 * El perfil de barbero vinculado se conserva desactivado y desvinculado.
 */
export async function eliminarUsuario(userId: string): Promise<ActionState> {
  try {
    const sesionAdmin = await requerirAdmin();
    if (!sesionAdmin) return { success: false, error: "No autorizado" };

    const parsed = esquemaUsuarioId.safeParse(userId);
    if (!parsed.success) return { success: false, error: "Usuario inválido" };

    if (parsed.data === sesionAdmin.user.id) {
      return { success: false, error: "No podés eliminar tu propia cuenta" };
    }

    await prisma.$transaction(async (tx) => {
      const usuario = await tx.user.findUnique({
        where: { id: parsed.data },
        select: { id: true, role: true, esInvitado: true, _count: { select: { turno: true } } },
      });
      if (!usuario || usuario.esInvitado) throw new EliminacionRechazadaError("Usuario no encontrado");

      if (usuario._count.turno > 0) {
        throw new EliminacionRechazadaError(
          "La cuenta tiene turnos registrados y no se puede eliminar sin perder el historial",
        );
      }

      if (usuario.role === "ADMIN") {
        const cantidadAdmins = await tx.user.count({ where: { role: "ADMIN" } });
        if (cantidadAdmins <= 1) throw new EliminacionRechazadaError("Debe quedar al menos un administrador");
      }

      await tx.barbero.updateMany({
        where: { usuarioId: usuario.id },
        data: { usuarioId: null, estado: false },
      });
      // SlotLock no tiene relación con user: se limpian los bloqueos temporales a mano.
      await tx.slotLock.deleteMany({ where: { userId: usuario.id } });
      await tx.user.delete({ where: { id: usuario.id } });
    }, { maxWait: 10000, timeout: 15000 });

    invalidarCacheRol(parsed.data);
    revalidatePath("/admin/usuarios");
    revalidarBarberos();
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    if (error instanceof EliminacionRechazadaError) {
      return { success: false, error: error.message };
    }
    const codigo = codigoError(error);
    if (codigo === "P2028") {
      return { success: false, error: "La operación tardó demasiado. Intentá nuevamente." };
    }
    console.error("Error al eliminar el usuario:", codigo ?? "desconocido");
    return { success: false, error: "No se pudo eliminar la cuenta" };
  }
}
