import { unstable_cache } from "next/cache";
import { DIAS_SEMANA, REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

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

    if (diasLaborales.length === 0) return ["Cerrado"];

    diasLaborales.sort((a, b) => REVERSE_MAPA_DIA_SEMANA_DB[a.dia] - REVERSE_MAPA_DIA_SEMANA_DB[b.dia]);

    const diasProcesados = diasLaborales.map(({ dia, margenes }) => {
      // Une franjas superpuestas o consecutivas.
      const fusionados: { desde: string; hasta: string }[] = [];
      for (const margen of margenes) {
        const ultimo = fusionados[fusionados.length - 1];
        if (ultimo && margen.desde <= ultimo.hasta) {
          if (margen.hasta > ultimo.hasta) ultimo.hasta = margen.hasta;
        } else {
          fusionados.push({ ...margen });
        }
      }

      return {
        num: REVERSE_MAPA_DIA_SEMANA_DB[dia],
        horario: fusionados.map(({ desde, hasta }) => `${desde} a ${hasta}`).join(", ") || "Cerrado",
      };
    });

    const grupos: { desde: number; hasta: number; horario: string }[] = [];

    for (const dia of diasProcesados) {
      const ultimoGrupo = grupos[grupos.length - 1];

      if (ultimoGrupo && ultimoGrupo.horario === dia.horario && ultimoGrupo.hasta === dia.num - 1) {
        ultimoGrupo.hasta = dia.num;
      } else {
        grupos.push({
          desde: dia.num,
          hasta: dia.num,
          horario: dia.horario,
        });
      }
    }

    return grupos.map(({ desde, hasta, horario }) => {
      const dias = desde === hasta ? DIAS_SEMANA[desde] : `${DIAS_SEMANA[desde]} a ${DIAS_SEMANA[hasta]}`;
      return `${dias} ${horario}`;
    });
  },
  ["horarios-compactos-publicos"],
  { tags: ["dias-laborales"], revalidate: 3600 },
);
