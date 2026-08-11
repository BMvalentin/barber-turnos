import { ZONA_HORARIA } from "@/lib/constants";

export function formatearFechaHora(
  fecha: Date | string,
  zonaHoraria: string = ZONA_HORARIA,
): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: zonaHoraria,
  }).format(new Date(fecha));
}
