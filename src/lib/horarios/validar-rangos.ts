import type { RangoHorario } from "@/types/horarios";
import { compararHoras } from "@/lib/horarios/comparar-horas";

/* Valida los rangos de horario de un día y devuelve un mensaje de error, o null si son válidos. */
export function validarRangosHorarios(rangos: RangoHorario[]): string | null {
  if (rangos.length === 0) {
    return "Completá las horas de inicio y fin.";
  }

  const rangosOrdenados = [...rangos].sort((a, b) => a.desde.localeCompare(b.desde));

  for (let i = 0; i < rangosOrdenados.length; i++) {
    const rango = rangosOrdenados[i];
    if (!rango.desde || !rango.hasta) {
      return "Completá las horas de inicio y fin.";
    }
    if (compararHoras(rango.hasta, rango.desde) <= 0) {
      return "La hora de fin debe ser posterior a la de inicio.";
    }
    if (i > 0 && compararHoras(rango.desde, rangosOrdenados[i - 1].hasta) < 0) {
      return "Los rangos de horario no pueden superponerse.";
    }
  }

  return null;
}
