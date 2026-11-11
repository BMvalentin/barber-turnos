"use client";

import { z } from "zod";
import type { Servicio } from "@/types/servicio";

const CLAVE_CACHE_SERVICIOS = "mayoraz-admin-servicios-v1";
const VIGENCIA_CACHE_MS = 24 * 60 * 60 * 1000;

const esquemaServicioCache = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  srcImage: z.string().nullable(),
  estado: z.boolean(),
  duracion: z.number(),
  precio: z.number(),
  descuento: z.number(),
  senia: z.number(),
  createdAt: z.string().datetime(),
  imagenes: z.array(z.string()),
});

const esquemaCacheServicios = z.object({
  version: z.literal(1),
  guardadoEn: z.number().finite(),
  servicios: z.array(esquemaServicioCache).max(500),
});

type CacheServicios = z.infer<typeof esquemaCacheServicios>;

function leerCache(): CacheServicios | null {
  try {
    const valor = window.localStorage.getItem(CLAVE_CACHE_SERVICIOS);
    if (!valor) return null;

    let contenido: unknown;
    try {
      contenido = JSON.parse(valor);
    } catch {
      window.localStorage.removeItem(CLAVE_CACHE_SERVICIOS);
      return null;
    }
    const resultado = esquemaCacheServicios.safeParse(contenido);
    if (!resultado.success || Date.now() - resultado.data.guardadoEn > VIGENCIA_CACHE_MS) {
      window.localStorage.removeItem(CLAVE_CACHE_SERVICIOS);
      return null;
    }
    return resultado.data;
  } catch {
    return null;
  }
}

function guardarCache(cache: CacheServicios): void {
  try {
    window.localStorage.setItem(CLAVE_CACHE_SERVICIOS, JSON.stringify(cache));
  } catch {
    // El panel sigue funcionando si el navegador bloquea o llena localStorage.
  }
}

export function leerServiciosCacheLocal(): Servicio[] | null {
  const cache = leerCache();
  return cache?.servicios.map((servicio) => ({
    ...servicio,
    createdAt: new Date(servicio.createdAt),
  })) ?? null;
}

export function guardarServiciosCacheLocal(servicios: Servicio[]): void {
  const datos = servicios.map((servicio) => ({
    ...servicio,
    createdAt: servicio.createdAt.toISOString(),
  }));
  const resultado = esquemaCacheServicios.safeParse({
    version: 1,
    guardadoEn: Date.now(),
    servicios: datos,
  });
  if (resultado.success) guardarCache(resultado.data);
}

export function actualizarServicioCacheLocal(servicio: Servicio): void {
  const cache = leerCache();
  if (!cache) return;

  const existe = cache.servicios.some((actual) => actual.id === servicio.id);
  const servicios = existe
    ? cache.servicios.map((actual) => actual.id === servicio.id
        ? { ...servicio, createdAt: servicio.createdAt.toISOString() }
        : actual)
    : [{ ...servicio, createdAt: servicio.createdAt.toISOString() }, ...cache.servicios];

  guardarCache({ ...cache, guardadoEn: Date.now(), servicios });
}

export function eliminarServicioCacheLocal(id: string): void {
  const cache = leerCache();
  if (!cache) return;
  guardarCache({
    ...cache,
    guardadoEn: Date.now(),
    servicios: cache.servicios.filter((servicio) => servicio.id !== id),
  });
}
