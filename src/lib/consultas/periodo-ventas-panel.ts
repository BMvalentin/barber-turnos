import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";

export const PERIODOS_VENTAS = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "semana", etiqueta: "Últimos 7 días" },
  { valor: "mes", etiqueta: "Este mes" },
] as const;

export type PeriodoVentas = (typeof PERIODOS_VENTAS)[number]["valor"];

export function leerPeriodoVentas(valor: string | string[] | undefined): PeriodoVentas {
  return PERIODOS_VENTAS.find((periodo) => periodo.valor === valor)?.valor ?? "hoy";
}

function desplazarDia(dia: string, cantidad: number): string {
  // Se desplaza la clave del calendario local, sin depender de la zona del servidor.
  const fecha = new Date(`${dia}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + cantidad);
  return fecha.toISOString().slice(0, 10);
}

export function obtenerPeriodoVentas(periodo: PeriodoVentas, ahora: Date) {
  const hoy = obtenerFechaSola(ahora);
  const desde = periodo === "semana"
    ? desplazarDia(hoy, -6)
    : periodo === "mes" ? `${hoy.slice(0, 7)}-01` : hoy;

  return {
    hoy,
    inicio: obtenerRangoDelDia(desde).inicio,
    inicioHoy: obtenerRangoDelDia(hoy).inicio,
    finExclusivo: obtenerRangoDelDia(desplazarDia(hoy, 1)).inicio,
  };
}
