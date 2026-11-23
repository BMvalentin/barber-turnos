import { DIAS_SEMANA_DB } from "@/lib/constants";
import type { BarberoListado } from "@/types/barbero";

type Horario = NonNullable<BarberoListado["horarios"]>[number];

function indiceDia(dia: string) {
  const indice = DIAS_SEMANA_DB.findIndex((diaSemana) => diaSemana === dia);
  return indice < 0 ? DIAS_SEMANA_DB.length : indice;
}

export function obtenerHorariosPorDia(horarios: Horario[] = []) {
  const porDia = new Map<string, Horario[]>();

  for (const horario of horarios) {
    const rangos = porDia.get(horario.dia.dia) ?? [];
    rangos.push(horario);
    porDia.set(horario.dia.dia, rangos);
  }

  return [...porDia.entries()]
    .sort(([diaA], [diaB]) => indiceDia(diaA) - indiceDia(diaB))
    .map(([dia, rangos]): [string, Horario[]] => [
      dia,
      rangos.sort((horarioA, horarioB) => horarioA.margenLaboral.desde.localeCompare(horarioB.margenLaboral.desde)),
    ]);
}

export function formatearNombreDia(dia: string) {
  if (dia === "Miercoles") return "Miércoles";
  if (dia === "Sabado") return "Sábado";
  return dia;
}
