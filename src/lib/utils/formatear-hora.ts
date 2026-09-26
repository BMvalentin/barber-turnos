import { ZONA_HORARIA } from "@/lib/constants";

export function formatearHora(fecha: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA_HORARIA,
  }).format(new Date(fecha));
}
