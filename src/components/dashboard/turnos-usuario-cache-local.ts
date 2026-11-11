"use client";

import { z } from "zod";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import type { ParcheTurnoCache } from "@/lib/admin/turnos-cache-local";
import type { TurnoListado } from "@/types/turno";

const PREFIJO_CACHE = "mayoraz-usuario-turnos-v2:";
const PREFIJO_CACHE_ANTERIOR = "mayoraz-usuario-turnos-v1:";
const MAX_TURNOS_CACHEADOS = 500;

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

const esquemaPaginaHistorial = z.object({
  turnos: z.array(esquemaTurno).max(MAX_TURNOS_CACHEADOS),
  paginaActual: z.number().int().positive(),
  totalPaginas: z.number().int().positive(),
});

const esquemaDatos = z.object({
  historial: esquemaPaginaHistorial,
  proximos: z.array(esquemaTurno).max(MAX_TURNOS_CACHEADOS),
});

const esquemaCache = z.object({
  version: z.literal(2),
  usuarioId: z.string(),
  datos: esquemaDatos,
});

export type DatosTurnosUsuarioCache = {
  historial: {
    turnos: TurnoListado[];
    paginaActual: number;
    totalPaginas: number;
  };
  proximos: TurnoListado[];
};

type CacheTurnosUsuario = z.infer<typeof esquemaCache>;

function obtenerClave(usuarioId: string): string {
  return `${PREFIJO_CACHE}${encodeURIComponent(usuarioId)}`;
}

function limpiarCacheAnterior(): void {
  for (let indice = window.localStorage.length - 1; indice >= 0; indice -= 1) {
    const clave = window.localStorage.key(indice);
    if (clave?.startsWith(PREFIJO_CACHE_ANTERIOR)) window.localStorage.removeItem(clave);
  }
}

function convertirTurno(turno: z.infer<typeof esquemaTurno>): TurnoListado {
  return { ...turno, horarioReservado: new Date(turno.horarioReservado) };
}

function serializarTurno(turno: TurnoListado): z.infer<typeof esquemaTurno> {
  return {
    ...turno,
    horarioReservado: new Date(turno.horarioReservado).toISOString(),
    precioCongelado: Number(turno.precioCongelado),
    seniaCongelada: Number(turno.seniaCongelada),
  };
}

function convertirDatos(datos: CacheTurnosUsuario["datos"]): DatosTurnosUsuarioCache {
  return {
    historial: {
      ...datos.historial,
      turnos: datos.historial.turnos.map(convertirTurno),
    },
    proximos: datos.proximos.map(convertirTurno),
  };
}

function leerCache(usuarioId: string): CacheTurnosUsuario | null {
  try {
    limpiarCacheAnterior();
    const clave = obtenerClave(usuarioId);
    const contenido = window.localStorage.getItem(clave);
    if (!contenido) return null;

    let valor: unknown;
    try {
      valor = JSON.parse(contenido);
    } catch {
      window.localStorage.removeItem(clave);
      return null;
    }

    const resultado = esquemaCache.safeParse(valor);
    if (!resultado.success || resultado.data.usuarioId !== usuarioId) {
      window.localStorage.removeItem(clave);
      return null;
    }
    return resultado.data;
  } catch {
    return null;
  }
}

export function leerTurnosUsuarioCacheLocal(
  usuarioId: string,
): DatosTurnosUsuarioCache | null {
  const cache = leerCache(usuarioId);
  if (!cache) return null;

  const perteneceAlUsuario = (turno: z.infer<typeof esquemaTurno>) =>
    turno.userId === usuarioId && turno.user.id === usuarioId;
  if (
    !cache.datos.historial.turnos.every(perteneceAlUsuario) ||
    !cache.datos.proximos.every(perteneceAlUsuario)
  ) {
    try {
      window.localStorage.removeItem(obtenerClave(usuarioId));
    } catch {
      // El contenido inválido se ignora aunque el navegador no permita borrarlo.
    }
    return null;
  }

  return convertirDatos(cache.datos);
}

export function guardarTurnosUsuarioCacheLocal(
  usuarioId: string,
  datos: DatosTurnosUsuarioCache,
): void {
  try {
    const datosLimitados = {
      historial: {
        ...datos.historial,
        turnos: datos.historial.turnos.slice(0, MAX_TURNOS_CACHEADOS),
      },
      proximos: datos.proximos.slice(0, MAX_TURNOS_CACHEADOS),
    };
    const resultado = esquemaCache.safeParse({
      version: 2,
      usuarioId,
      datos: {
        historial: {
          ...datosLimitados.historial,
          turnos: datosLimitados.historial.turnos.map(serializarTurno),
        },
        proximos: datosLimitados.proximos.map(serializarTurno),
      },
    });
    if (resultado.success) {
      window.localStorage.setItem(obtenerClave(usuarioId), JSON.stringify(resultado.data));
    }
  } catch {
    // La pantalla sigue funcionando si el navegador bloquea o llena localStorage.
  }
}

export function actualizarTurnoUsuarioCacheLocal(
  usuarioId: string,
  turnoId: string,
  parche: ParcheTurnoCache,
): void {
  const cache = leerCache(usuarioId);
  if (!cache) return;

  let encontrado = false;
  const actualizar = (turno: TurnoListado): TurnoListado => {
    if (turno.id !== turnoId) return turno;
    encontrado = true;
    return {
      ...turno,
      ...parche,
      horarioReservado: parche.horarioReservado ?? turno.horarioReservado,
    };
  };
  const datos = convertirDatos(cache.datos);
  const actualizados: DatosTurnosUsuarioCache = {
    historial: {
      ...datos.historial,
      turnos: datos.historial.turnos.map(actualizar),
    },
    proximos: datos.proximos.map(actualizar),
  };

  if (encontrado) guardarTurnosUsuarioCacheLocal(usuarioId, actualizados);
}

export function limpiarTurnosUsuarioCacheLocal(): void {
  try {
    for (let indice = window.localStorage.length - 1; indice >= 0; indice -= 1) {
      const clave = window.localStorage.key(indice);
      if (
        clave?.startsWith(PREFIJO_CACHE) ||
        clave?.startsWith(PREFIJO_CACHE_ANTERIOR)
      ) {
        window.localStorage.removeItem(clave);
      }
    }
  } catch {
    // La sesión puede cerrarse aunque el navegador no permita limpiar localStorage.
  }
}
