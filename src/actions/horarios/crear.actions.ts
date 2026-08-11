"use server";

import { revalidarDiasLaborales } from "@/lib/revalidar/revalidar-dias-laborales";
import { prisma } from "@/lib/prisma";
import { MAPA_DIA_SEMANA_DB, REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

import type { ActionState } from "@/types/action-state";
import type { DiaLaboralCreado } from "@/types/horarios";
import type { dias_laborales } from "../../../generated/prisma/client";

async function createBase(
  prevState: ActionState<DiaLaboralCreado>,
  formData: FormData
): Promise<ActionState<DiaLaboralCreado>> {
  try {
    const dia = parseInt(formData.get("dia") as string);
    const diaEnum = MAPA_DIA_SEMANA_DB[dia];
    const estado = formData.get("estado") === "true";

    // Verificar si ya existe
    const existing = await prisma.dia_laboral.findFirst({
      where: { dia: diaEnum as dias_laborales },
    });

    if (existing) {
      return {
        success: false,
        error: "Ya existe un registro para este día de la semana",
      };
    }

    const diaLaboral = await prisma.dia_laboral.create({
      data: {
        dia: diaEnum as dias_laborales,
        estado,
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
    console.error("Error al crear día laboral:", error);
    return {
      success: false,
      error: "Error al crear el día laboral",
    };
  }
}

export const create = exigirAdmin(createBase);
