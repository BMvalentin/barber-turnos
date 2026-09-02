"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { ActionState } from "@/types/action-state";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function removerHorarioDeBarberoBase(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const idsRaw = formData.get("ids");

    if (!idsRaw) {
      return { success: false, error: "ID requerido" };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(String(idsRaw));
    } catch {
      return { success: false, error: "ID requerido" };
    }

    const ids = parsed as unknown as string[];
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
      return { success: false, error: "ID requerido" };
    }
    if (ids.length === 0) {
      return { success: false, error: "ID requerido" };
    }

    await prisma.margen_laboral_barbero.deleteMany({
      where: { id: { in: ids } },
    });

    revalidarBarberos();

    return { success: true };
  } catch (error) {
    console.error("Error al remover horario:", error);
    return { success: false, error: "Error al remover horario" };
  }
}

export const removerHorarioDeBarbero = exigirAdmin(removerHorarioDeBarberoBase);