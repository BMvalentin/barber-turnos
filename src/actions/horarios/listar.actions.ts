"use server";

import { prisma } from "@/lib/prisma";
import { MAPA_DIA_SEMANA_DB, REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";
import { obtenerDiasLaborales } from "@/lib/consultas/obtener-dias-laborales";

import type { Prisma, dias_laborales } from "../../../generated/prisma/client";

type DiaLaboralConMargenes = Prisma.dia_laboralGetPayload<{
  include: { margenes: true };
}>;

export async function getDiasLaborales() {
  try {
    const diasEnDb = await obtenerDiasLaborales();

    const formatDia = (d: DiaLaboralConMargenes) => ({
      ...d,
      dia: REVERSE_MAPA_DIA_SEMANA_DB[d.dia]
    });

    // Si faltan días, los creamos como activos por defecto
    if (diasEnDb.length < 7) {
      const idsExistentes = diasEnDb.map((d) => REVERSE_MAPA_DIA_SEMANA_DB[d.dia]);
      const diasFaltantes = [0, 1, 2, 3, 4, 5, 6].filter((id) => !idsExistentes.includes(id));

      if (diasFaltantes.length > 0) {
        await prisma.dia_laboral.createMany({
          data: diasFaltantes.map((diaIndex) => ({
            dia: MAPA_DIA_SEMANA_DB[diaIndex] as dias_laborales,
            estado: true,
          })),
        });

        // Retornamos la lista completa actualizada
        const updatedDias = await obtenerDiasLaborales();

        return updatedDias.map(formatDia).sort((a, b) => a.dia - b.dia);
      }
    }

    return diasEnDb.map(formatDia).sort((a, b) => a.dia - b.dia);
  } catch (error) {
    console.error("Error al obtener días laborales:", error);
    throw new Error("Error al obtener los días laborales");
  }
}
