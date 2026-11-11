"use client";

import { z } from "zod";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import type { TurnoListado } from "@/types/turno";

const PREFIJO_CACHE = "mayoraz-admin-turnos-v2:";
const PREFIJO_CACHE_ANTERIOR = "mayoraz-admin-turnos-v1:";
const CLAVE_ALCANCE_ACTIVO = "mayoraz-admin-turnos-alcance-v2";
const CLAVE_ALCANCE_ANTERIOR = "mayoraz-admin-turnos-alcance-v1";
const VIGENCIA_CACHE_MS = 10 * 60 * 1000;
const MAX_TURNOS_CACHEADOS = 25000;

const esquemaUsuario = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  telefono: z.string().nullable(),
  esInvitado: z.boolean(),
  emailContacto: z.string().nullable(),
});

const esquemaTurno = z.object({
  id: z.string(),
  userId: z.string(),
  clienteNombre: z.string().nullable(),
  clienteApellido: z.string().nullable(),
  clienteTelefono: z.string().nullable(),
  clienteEmail: z.string().nullable(),
  barberoId: z.string(),
  servicioId: z.string(),
  horarioReservado: z.string().datetime(),
  precioCongelado: z.number(),
  seniaCongelada: z.number(),
  estado: z.enum(ESTADOS_TURNO),
  estadoPago: z.enum(ESTADOS_PAGO),
  tipoPago: z.string().nullable(),
  metodoPago: z.string().nullable(),
  user: esquemaUsuario,
  servicio: z.object({ id: z.string(), nombre: z.string(), duracion: z.number() }),
  barbero: z.object({ id: z.string(), nombre: z.string() }),
});

const esquemaCache = z.object({
  version: z.literal(2),
  alcance: z.string(),
  guardadaEn: z.number().finite(),
  turnos: z.array(esquemaTurno).max(MAX_TURNOS_CACHEADOS),
});

type CacheTurnos = z.infer<typeof esquemaCache>;
type TurnoCacheado = z.infer<typeof esquemaTurno>;

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

export type ResultadoCacheTurnos = {
  turnos: TurnoListado[];
  vigente: boolean;
};

function claveAlcance(alcance: string): string {
  return `${PREFIJO_CACHE}${encodeURIComponent(alcance)}`;
}

function prepararAlcance(alcance: string): void {
  const almacenamiento = window.localStorage;
  const alcanceAnterior = almacenamiento.getItem(CLAVE_ALCANCE_ACTIVO);
  if (alcanceAnterior === alcance) return;

  for (let indice = almacenamiento.length - 1; indice >= 0; indice -= 1) {
    const clave = almacenamiento.key(indice);
    if (
      clave?.startsWith(PREFIJO_CACHE) ||
      clave?.startsWith(PREFIJO_CACHE_ANTERIOR)
    ) {
      almacenamiento.removeItem(clave);
    }
  }
  almacenamiento.removeItem(CLAVE_ALCANCE_ANTERIOR);
  almacenamiento.setItem(CLAVE_ALCANCE_ACTIVO, alcance);
}

function leerCache(alcance: string): CacheTurnos | null {
  try {
    prepararAlcance(alcance);
    const clave = claveAlcance(alcance);
    const texto = window.localStorage.getItem(clave);
    if (!texto) return null;

    let valor: unknown;
    try {
      valor = JSON.parse(texto);
    } catch {
      window.localStorage.removeItem(clave);
      return null;
    }

    const resultado = esquemaCache.safeParse(valor);
    if (!resultado.success || resultado.data.alcance !== alcance) {
      window.localStorage.removeItem(clave);
      return null;
    }
    return resultado.data;
  } catch {
    return null;
  }
}

function guardarCache(alcance: string, cache: CacheTurnos): void {
  try {
    prepararAlcance(alcance);
    window.localStorage.setItem(claveAlcance(alcance), JSON.stringify(cache));
  } catch {
    // La vista funciona en memoria si el navegador bloquea o llena localStorage.
  }
}

function convertirTurno(turno: TurnoCacheado): TurnoListado {
  return { ...turno, horarioReservado: new Date(turno.horarioReservado) };
}

function serializarTurno(turno: TurnoListado): TurnoCacheado {
  return {
    ...turno,
    horarioReservado: new Date(turno.horarioReservado).toISOString(),
    precioCongelado: Number(turno.precioCongelado),
    seniaCongelada: Number(turno.seniaCongelada),
  };
}

function ordenarTurnosCacheados(turnos: TurnoCacheado[]): TurnoCacheado[] {
  return [...turnos].sort(
    (primero, segundo) =>
      new Date(segundo.horarioReservado).getTime() - new Date(primero.horarioReservado).getTime(),
  );
}

export function leerTurnosCacheLocal(alcance: string): ResultadoCacheTurnos | null {
  const cache = leerCache(alcance);
  if (!cache) return null;

  return {
    turnos: cache.turnos.map(convertirTurno),
    vigente: Date.now() - cache.guardadaEn <= VIGENCIA_CACHE_MS,
  };
}

export function guardarTurnosCacheLocal(alcance: string, turnos: TurnoListado[]): void {
  const resultado = esquemaCache.safeParse({
    version: 2,
    alcance,
    guardadaEn: Date.now(),
    turnos: ordenarTurnosCacheados(turnos.map(serializarTurno)),
  });
  if (resultado.success) guardarCache(alcance, resultado.data);
}

export function actualizarTurnoCacheLocal(
  alcance: string,
  id: string,
  parche: ParcheTurnoCache,
): void {
  const cache = leerCache(alcance);
  if (!cache) return;

  let encontrado = false;
  const turnos = cache.turnos.map((turno) => {
    if (turno.id !== id) return turno;
    encontrado = true;
    return esquemaTurno.parse({
      ...turno,
      ...parche,
      ...(parche.horarioReservado !== undefined
        ? { horarioReservado: new Date(parche.horarioReservado).toISOString() }
        : {}),
      ...(parche.precioCongelado !== undefined
        ? { precioCongelado: Number(parche.precioCongelado) }
        : {}),
      ...(parche.seniaCongelada !== undefined
        ? { seniaCongelada: Number(parche.seniaCongelada) }
        : {}),
    });
  });

  if (encontrado) {
    guardarCache(alcance, {
      ...cache,
      guardadaEn: Date.now(),
      turnos: ordenarTurnosCacheados(turnos),
    });
  }
}

export function insertarTurnoCacheLocal(alcance: string, turno: TurnoListado): void {
  const cache = leerCache(alcance);
  if (!cache) return;

  const turnos = ordenarTurnosCacheados([
    serializarTurno(turno),
    ...cache.turnos.filter((actual) => actual.id !== turno.id),
  ]);
  const resultado = esquemaCache.safeParse({
    ...cache,
    guardadaEn: Date.now(),
    turnos,
  });
  if (resultado.success) guardarCache(alcance, resultado.data);
}

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
    // No se bloquea el cierre de sesión por una limitación del almacenamiento.
  }
}
