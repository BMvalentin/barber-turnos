"use client";

import type { TurnoListado } from "@/types/turno";

const PREFIJO_CACHE = "mayoraz-admin-turnos-v2:";
const PREFIJO_CACHE_ANTERIOR = "mayoraz-admin-turnos-v1:";
const CLAVE_ALCANCE_ACTIVO = "mayoraz-admin-turnos-alcance-v2";
const CLAVE_ALCANCE_ANTERIOR = "mayoraz-admin-turnos-alcance-v1";

export type ParcheTurnoCache = Partial<Pick<TurnoListado,
  | "estado"
  | "estadoPago"
  | "tipoPago"
  | "metodoPago"
  | "horarioReservado"
  | "barberoId"
  | "servicioId"
  | "precioCongelado"
  | "seniaCongelada"
  | "servicio"
  | "barbero"
>>;

/** Limpia turnos guardados por versiones anteriores de la agenda administrativa. */
export function limpiarCacheTurnosLocal(): void {
  try {
    for (let indice = window.localStorage.length - 1; indice >= 0; indice -= 1) {
      const clave = window.localStorage.key(indice);
      if (
        clave?.startsWith(PREFIJO_CACHE) ||
        clave?.startsWith(PREFIJO_CACHE_ANTERIOR) ||
        clave === CLAVE_ALCANCE_ACTIVO ||
        clave === CLAVE_ALCANCE_ANTERIOR
      ) {
        window.localStorage.removeItem(clave);
      }
    }
  } catch {
    // La aplicación sigue funcionando si el navegador bloquea el almacenamiento.
  }
}
