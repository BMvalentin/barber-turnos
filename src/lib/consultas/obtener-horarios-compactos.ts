import { unstable_cache } from "next/cache";
import { DIAS_SEMANA, REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { RangoHorario } from "@/types/horarios";

export const obtenerHorariosCompactos = unstable_cache(
  async () => {
    const diasLaborales = await prisma.dia_laboral.findMany({
      where: { estado: true },
      select: {
        dia: true,
        margenes: {
          where: { estado: true },
          select: { desde: true, hasta: true },
          orderBy: { desde: "asc" },
        },
      },
    });

    diasLaborales.sort((a, b) => REVERSE_MAPA_DIA_SEMANA_DB[a.dia] - REVERSE_MAPA_DIA_SEMANA_DB[b.dia]);
    const grupos: { diaDesde: number; diaHasta: number; rangos: RangoHorario[] }[] = [];

    for (const { dia, margenes } of diasLaborales) {
      const numeroDia = REVERSE_MAPA_DIA_SEMANA_DB[dia];
      // Une franjas superpuestas o consecutivas.
      const rangos: RangoHorario[] = [];
      for (const margen of margenes) {
        const ultimo = rangos[rangos.length - 1];
        if (ultimo && margen.desde <= ultimo.hasta) {
          if (margen.hasta > ultimo.hasta) ultimo.hasta = margen.hasta;
        } else {
          rangos.push({ ...margen });
        }
      }

      const ultimoGrupo = grupos[grupos.length - 1];

      if (
        ultimoGrupo &&
        ultimoGrupo.diaHasta === numeroDia - 1 &&
        ultimoGrupo.rangos.length === rangos.length &&
        rangos.every(({ desde, hasta }, indice) =>
          desde === ultimoGrupo.rangos[indice].desde && hasta === ultimoGrupo.rangos[indice].hasta
        )
      ) {
        ultimoGrupo.diaHasta = numeroDia;
      } else {
        grupos.push({ diaDesde: numeroDia, diaHasta: numeroDia, rangos });
      }
    }

    return grupos.map(({ diaDesde, diaHasta, rangos }) => ({
      dias: diaDesde === diaHasta ? DIAS_SEMANA[diaDesde] : `${DIAS_SEMANA[diaDesde]} a ${DIAS_SEMANA[diaHasta]}`,
      rangos,
    }));
  },
  ["horarios-compactos-publicos-v2"],
  { tags: ["dias-laborales"], revalidate: 3600 },
);
