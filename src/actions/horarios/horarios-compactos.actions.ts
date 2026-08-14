"use server";

import { DIAS_SEMANA, REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";
import { obtenerDiasLaboralesActivos } from "@/lib/consultas/obtener-dias-laborales-activos";

export async function getHorariosCompactos() {
  try {
    const diasLaborales = await obtenerDiasLaboralesActivos();

    if (diasLaborales.length === 0) return ["Cerrado"];

    // Ordenar los días cronológicamente
    diasLaborales.sort((a, b) => REVERSE_MAPA_DIA_SEMANA_DB[a.dia] - REVERSE_MAPA_DIA_SEMANA_DB[b.dia]);

    // 1. Mapeamos a un formato procesable
    const diasProcesados = diasLaborales.map((d) => {
      // Ordenar márgenes por hora de inicio
      const margenes: { desde: string; hasta: string }[] = [...d.margenes].sort(
        (a, b) => a.desde.localeCompare(b.desde)
      );

      if (margenes.length === 0) {
        return { num: REVERSE_MAPA_DIA_SEMANA_DB[d.dia], nombre: DIAS_SEMANA[REVERSE_MAPA_DIA_SEMANA_DB[d.dia]], horario: "Cerrado" };
      }

      // Fusionar rangos solapados: si A y B se superponen, tomar el mayor span
      const fusionados: { desde: string; hasta: string }[] = [];
      for (const m of margenes) {
        const ultimo = fusionados[fusionados.length - 1];
        if (ultimo && m.desde <= ultimo.hasta) {
          // Se solapa: extender el hasta si el nuevo es mayor
          if (m.hasta > ultimo.hasta) ultimo.hasta = m.hasta;
        } else {
          fusionados.push({ desde: m.desde, hasta: m.hasta });
        }
      }

      const horarioStr = fusionados.map((f) => `${f.desde} a ${f.hasta}`).join(", ");
      const numDia = REVERSE_MAPA_DIA_SEMANA_DB[d.dia];

      return {
        num: numDia,
        nombre: DIAS_SEMANA[numDia],
        horario: horarioStr || "Cerrado",
      };
    });

    // 2. Agrupación por continuidad y similitud de horarios
    const grupos: { start: number; end: number; horario: string }[] = [];

    for (const dia of diasProcesados) {
      const ultimoGrupo = grupos[grupos.length - 1];

      // Si el horario es igual al del grupo anterior Y es el día consecutivo
      if (ultimoGrupo && ultimoGrupo.horario === dia.horario && ultimoGrupo.end === dia.num - 1) {
        ultimoGrupo.end = dia.num;
      } else {
        grupos.push({
          start: dia.num,
          end: dia.num,
          horario: dia.horario,
        });
      }
    }

    // 3. Formatear el string final
    return grupos.map((g) => {
      const nombreRango =
        g.start === g.end
          ? DIAS_SEMANA[g.start]
          : `${DIAS_SEMANA[g.start]} a ${DIAS_SEMANA[g.end]}`;

      return `${nombreRango} ${g.horario}`;
    });

  } catch (error) {
    console.error("Error obteniendo horarios:", error);
    return ["Error al cargar horarios"];
  }
}
