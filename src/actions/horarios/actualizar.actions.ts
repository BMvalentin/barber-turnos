"use server";

import { revalidarDiasLaborales } from "@/lib/revalidar/revalidar-dias-laborales";
import { prisma } from "@/lib/prisma";
import { MAPA_DIA_SEMANA_DB, REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

import type { ActionState } from "@/types/action-state";
import type { DiaLaboralCreado } from "@/types/horarios";
import type { dias_laborales } from "../../../generated/prisma/client";

async function updateBase(
  prevState: ActionState<DiaLaboralCreado>,
  formData: FormData
): Promise<ActionState<DiaLaboralCreado>> {
  try {
    const id = formData.get("id") as string;
    const dia = parseInt(formData.get("dia") as string);
    const diaEnum = MAPA_DIA_SEMANA_DB[dia];
    const estado = formData.get("estado") === "true";

    // Verificar si existe
    const existing = await prisma.dia_laboral.findUnique({
      where: { id },
    });

    // Verificar conflictos con otros días
    const conflict = await prisma.dia_laboral.findFirst({
      where: {
        dia: diaEnum as dias_laborales,
        id: { not: id },
      },
    });

    if (conflict) {
      return {
        success: false,
        error: "Ya existe un registro para este día de la semana",
      };
    }

    const diaLaboral = await prisma.dia_laboral.update({
      where: { id },
      data: {
        dia: diaEnum as dias_laborales,
        estado,
        updatedAt: new Date(),
      },
    });

    revalidarDiasLaborales();

    return {
      success: true,
      data: {
        ...diaLaboral,
        dia: REVERSE_MAPA_DIA_SEMANA_DB[diaLaboral.dia]
      },
    };
  } catch (error) {
    console.error("Error al actualizar día laboral:", error);
    return {
      success: false,
      error: "Error al actualizar el día laboral",
    };
  }
}

export const update = exigirAdmin(updateBase);
