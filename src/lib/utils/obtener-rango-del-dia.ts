import { fromZonedTime } from "date-fns-tz";
import { ZONA_HORARIA } from "@/lib/constants";

export function obtenerRangoDelDia(fecha: string): { inicio: Date; fin: Date } {
  return {
    inicio: fromZonedTime(fecha + "T00:00:00", ZONA_HORARIA),
    fin: fromZonedTime(fecha + "T23:59:59", ZONA_HORARIA),
  };
}
