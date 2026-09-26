"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { ActionState } from "@/types/action-state";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";

async function removerHorarioDeBarberoBase(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const contexto = await requerirPanel();
    if (!contexto) return { success: false, error: "No autorizado" };

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

    const resultadoIds = z.array(z.string().min(1)).safeParse(parsed);
    if (!resultadoIds.success) {
      return { success: false, error: "ID requerido" };
    }
    const ids = resultadoIds.data;
    if (ids.length === 0) {
      return { success: false, error: "ID requerido" };
    }

    if (contexto.rol === "EMPLEADO") {
      const idsUnicos = [...new Set(ids)];
      const asignaciones = await prisma.margen_laboral_barbero.findMany({
        where: { id: { in: idsUnicos } },
        select: { barberoId: true },
      });
      if (
        asignaciones.length !== idsUnicos.length ||
        asignaciones.some((asignacion) => asignacion.barberoId !== contexto.barberoId)
      ) {
        return { success: false, error: "No autorizado" };
      }
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

export const removerHorarioDeBarbero = removerHorarioDeBarberoBase;
