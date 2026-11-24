"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import type { ActionState } from "@/types/action-state";

export async function desactivarPerfilProfesional(): Promise<ActionState> {
  try {
    const contexto = await requerirPanel();
    if (!contexto?.barberoId) return { success: false, error: "No autorizado." };

    const { count } = await prisma.barbero.updateMany({
      where: { id: contexto.barberoId, usuarioId: contexto.session.user.id },
      data: { estado: false },
    });
    if (count === 0) return { success: false, error: "No encontramos tu perfil profesional." };

    revalidarBarberos();
    return { success: true };
  } catch {
    return { success: false, error: "No pudimos desactivar tu perfil. Volvé a intentarlo." };
  }
}
