"use server";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MAPA_DIA_SEMANA_DB, REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";
import { obtenerDiasLaborales } from "@/lib/consultas/obtener-dias-laborales";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";

import type { dias_laborales } from "../../../generated/prisma/client";

const obtenerDiasLaboralesConfiguracionCacheados = unstable_cache(
  async () => {
    const diasEnDb = await obtenerDiasLaborales();

    if (diasEnDb.length < 7) {
      const idsExistentes = diasEnDb.map((dia) => REVERSE_MAPA_DIA_SEMANA_DB[dia.dia]);
      const diasFaltantes = [0, 1, 2, 3, 4, 5, 6].filter((dia) => !idsExistentes.includes(dia));

      if (diasFaltantes.length > 0) {
        await prisma.dia_laboral.createMany({
          data: diasFaltantes.map((diaIndex) => ({
            dia: MAPA_DIA_SEMANA_DB[diaIndex] as dias_laborales,
            estado: true,
          })),
        });
      }
    }

    const diasActualizados = diasEnDb.length < 7
      ? await obtenerDiasLaborales()
      : diasEnDb;
    return diasActualizados
      .map((dia) => ({ id: dia.id, dia: REVERSE_MAPA_DIA_SEMANA_DB[dia.dia] }))
      .sort((primero, segundo) => primero.dia - segundo.dia);
  },
  ["dias-laborales-configuracion-v1"],
  { tags: ["dias-laborales"], revalidate: 3600 },
);

export async function getDiasLaborales() {
  try {
    if (!(await requerirPanel())) throw new Error("No autorizado");
    return await obtenerDiasLaboralesConfiguracionCacheados();
  } catch (error) {
    console.error("Error al obtener días laborales:", error);
    throw new Error("Error al obtener los días laborales");
  }
}
