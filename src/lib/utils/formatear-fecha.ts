import { ZONA_HORARIA } from "@/lib/constants";

export function formatearFecha(
  fecha: Date | string,
  zonaHoraria: string = ZONA_HORARIA,
): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: zonaHoraria,
  }).format(new Date(fecha));
}
