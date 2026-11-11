"use client";

import { z } from "zod";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import type { TurnoListado } from "@/types/turno";

const PREFIJO_CACHE = "mayoraz-admin-turnos-v1:";
const CLAVE_ALCANCE_ACTIVO = "mayoraz-admin-turnos-alcance-v1";
const VIGENCIA_CACHE_MS = 2 * 60 * 1000;
const MAX_CONSULTAS_CACHEADAS = 40;

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

const esquemaConsulta = z.object({
  clave: z.string(),
  guardadaEn: z.number().finite(),
  totalPaginas: z.number().int().positive(),
  pagina: z.number().int().positive(),
  turnos: z.array(esquemaTurno).max(100),
});

const esquemaCache = z.object({
  version: z.literal(1),
  alcance: z.string(),
  consultas: z.array(esquemaConsulta).max(MAX_CONSULTAS_CACHEADAS),
});

type ConsultaCacheada = z.infer<typeof esquemaConsulta>;
type CacheTurnos = z.infer<typeof esquemaCache>;
type TurnoCacheado = z.infer<typeof esquemaTurno>;

export type FiltrosCacheTurnos = {
  pagina: number;
  estado: string;
  fecha: string;
  barberoId: string;
};

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
  totalPaginas: number;
  pagina: number;
};

function claveConsulta(filtros: FiltrosCacheTurnos): string {
  return JSON.stringify([
    filtros.pagina,
    filtros.estado,
    filtros.fecha,
    filtros.barberoId,
  ]);
}

function claveAlcance(alcance: string): string {
  return `${PREFIJO_CACHE}${encodeURIComponent(alcance)}`;
}

function prepararAlcance(alcance: string): void {
  const alcanceAnterior = window.localStorage.getItem(CLAVE_ALCANCE_ACTIVO);
  if (alcanceAnterior === alcance) return;

  for (let indice = window.localStorage.length - 1; indice >= 0; indice -= 1) {
    const clave = window.localStorage.key(indice);
    if (clave?.startsWith(PREFIJO_CACHE)) window.localStorage.removeItem(clave);
  }
  window.localStorage.setItem(CLAVE_ALCANCE_ACTIVO, alcance);
}

function leerCache(alcance: string): CacheTurnos | null {
  try {
    prepararAlcance(alcance);
    const texto = window.localStorage.getItem(claveAlcance(alcance));
    if (!texto) return null;

    let valor: unknown;
    try {
      valor = JSON.parse(texto);
    } catch {
      window.localStorage.removeItem(claveAlcance(alcance));
      return null;
    }

    const resultado = esquemaCache.safeParse(valor);
    if (!resultado.success || resultado.data.alcance !== alcance) {
      window.localStorage.removeItem(claveAlcance(alcance));
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
    // El listado sigue funcionando si el navegador bloquea o llena localStorage.
  }
}

function convertirTurno(turno: TurnoCacheado): TurnoListado {
  return {
    ...turno,
    horarioReservado: new Date(turno.horarioReservado),
  };
}

function serializarTurno(turno: TurnoListado): TurnoCacheado {
  return {
    ...turno,
    horarioReservado: new Date(turno.horarioReservado).toISOString(),
    precioCongelado: Number(turno.precioCongelado),
    seniaCongelada: Number(turno.seniaCongelada),
  };
}

export function leerConsultaTurnosCacheLocal(
  alcance: string,
  filtros: FiltrosCacheTurnos,
): ResultadoCacheTurnos | null {
  const cache = leerCache(alcance);
  const consulta = cache?.consultas.find((entrada) => entrada.clave === claveConsulta(filtros));
  if (!consulta || Date.now() - consulta.guardadaEn > VIGENCIA_CACHE_MS) return null;

  return {
    turnos: consulta.turnos.map(convertirTurno),
    totalPaginas: consulta.totalPaginas,
    pagina: consulta.pagina,
  };
}

export function guardarConsultaTurnosCacheLocal(
  alcance: string,
  filtros: FiltrosCacheTurnos,
  resultado: ResultadoCacheTurnos,
): void {
  const clave = claveConsulta(filtros);
  const consulta = esquemaConsulta.safeParse({
    clave,
    guardadaEn: Date.now(),
    totalPaginas: Math.max(1, resultado.totalPaginas),
    pagina: resultado.pagina,
    turnos: resultado.turnos.map(serializarTurno),
  });
  if (!consulta.success) return;

  const cacheActual = leerCache(alcance);
  const consultas: ConsultaCacheada[] = [
    consulta.data,
    ...(cacheActual?.consultas.filter((entrada) => entrada.clave !== clave) ?? []),
  ].slice(0, MAX_CONSULTAS_CACHEADAS);

  guardarCache(alcance, { version: 1, alcance, consultas });
}

export function actualizarTurnoCacheLocal(
  alcance: string,
  id: string,
  parche: ParcheTurnoCache,
): void {
  const cache = leerCache(alcance);
  if (!cache) return;

  const consultas = cache.consultas.map((consulta) => {
    let cambio = false;
    const turnos = consulta.turnos.map((turno) => {
      if (turno.id !== id) return turno;
      cambio = true;
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
    return cambio ? { ...consulta, guardadaEn: Date.now(), turnos } : consulta;
  });

  guardarCache(alcance, { ...cache, consultas });
}

export function limpiarCacheTurnosLocal(): void {
  try {
    for (let indice = window.localStorage.length - 1; indice >= 0; indice -= 1) {
      const clave = window.localStorage.key(indice);
      if (clave?.startsWith(PREFIJO_CACHE) || clave === CLAVE_ALCANCE_ACTIVO) {
        window.localStorage.removeItem(clave);
      }
    }
  } catch {
    // No se bloquea el cierre de sesión por una limitación del almacenamiento.
  }
}
