"use server";

import { prisma } from "@/lib/prisma";
import { REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";

export async function getDiaLaboralById(id: string) {
  try {
    const diaLaboral = await prisma.dia_laboral.findUnique({
      where: { id },
      include: {
        margenes: true,
      },
    });

    if (!diaLaboral) return null;

    return {
      ...diaLaboral,
      dia: REVERSE_MAPA_DIA_SEMANA_DB[diaLaboral.dia]
    };
  } catch (error) {
    console.error("Error al obtener día laboral:", error);
    throw new Error("Error al obtener el día laboral");
  }
}
