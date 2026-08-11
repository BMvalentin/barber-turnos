import { toZonedTime } from "date-fns-tz";
import { ZONA_HORARIA } from "@/lib/constants";

export function obtenerFechaSola(fecha: Date | string): string {
  const zoned = toZonedTime(fecha, ZONA_HORARIA);
  return `${zoned.getFullYear()}-${String(zoned.getMonth() + 1).padStart(2, "0")}-${String(zoned.getDate()).padStart(2, "0")}`;
}
