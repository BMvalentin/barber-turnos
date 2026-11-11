"use client";

import type { Servicio } from "@/types/servicio";

const CLAVE_CACHE_ANTERIOR = "mayoraz-admin-servicios-v1";
const VIGENCIA_CACHE_MS = 5 * 60 * 1000;

type CacheServicios = {
  alcance: string;
  guardadoEn: number;
  servicios: Servicio[];
};

let cache: CacheServicios | null = null;
let almacenamientoAnteriorLimpiado = false;

function limpiarAlmacenamientoAnterior(): void {
  if (almacenamientoAnteriorLimpiado || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLAVE_CACHE_ANTERIOR);
    almacenamientoAnteriorLimpiado = true;
  } catch {
    // Se vuelve a intentar cuando el navegador permita acceder al almacenamiento.
  }
}

function leerCache(alcance: string): CacheServicios | null {
  limpiarAlmacenamientoAnterior();
  if (cache?.alcance !== alcance) cache = null;
  if (!cache) return null;
  if (Date.now() - cache.guardadoEn > VIGENCIA_CACHE_MS) {
    cache = null;
    return null;
  }
  return cache;
}

export function leerServiciosCacheLocal(alcance: string): Servicio[] | null {
  return leerCache(alcance)?.servicios ?? null;
}

export function guardarServiciosCacheLocal(alcance: string, servicios: Servicio[]): void {
  limpiarAlmacenamientoAnterior();
  cache = { alcance, guardadoEn: Date.now(), servicios: [...servicios] };
}

export function actualizarServicioCacheLocal(alcance: string, servicio: Servicio): void {
  const actual = leerCache(alcance);
  if (!actual) return;
  const existe = actual.servicios.some((guardado) => guardado.id === servicio.id);
  cache = {
    ...actual,
    guardadoEn: Date.now(),
    servicios: existe
      ? actual.servicios.map((guardado) => guardado.id === servicio.id ? servicio : guardado)
      : [servicio, ...actual.servicios],
  };
}

export function eliminarServicioCacheLocal(alcance: string, id: string): void {
  const actual = leerCache(alcance);
  if (!actual) return;
  cache = {
    ...actual,
    guardadoEn: Date.now(),
    servicios: actual.servicios.filter((servicio) => servicio.id !== id),
  };
}

export function limpiarCacheServiciosLocal(): void {
  cache = null;
  limpiarAlmacenamientoAnterior();
}
