"use server";

import { prisma } from "@/lib/prisma";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import { SELECCION_USUARIO_BASICA } from "@/lib/constants";
import {
  ESTADOS_PAGO_VISIBLES_USUARIO,
  ESTADOS_TURNO_ACTIVOS,
} from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type { TurnoListado } from "@/types/turno";
import type { Prisma } from "../../../generated/prisma/client";

const TAMANIO_PAGINA = 5;

type PaginaTurnosUsuario = {
  turnos: TurnoListado[];
  paginaActual: number;
  totalPaginas: number;
};

type ResumenTurnosUsuario = {
  historial: PaginaTurnosUsuario;
  proximos: TurnoListado[];
};

const SELECCION_TURNO_USUARIO = {
  id: true,
  userId: true,
  clienteNombre: true,
  clienteApellido: true,
  clienteTelefono: true,
  clienteEmail: true,
  barberoId: true,
  servicioId: true,
  horarioReservado: true,
  precioCongelado: true,
  seniaCongelada: true,
  estado: true,
  estadoPago: true,
  tipoPago: true,
  metodoPago: true,
  user: { select: SELECCION_USUARIO_BASICA },
  servicio: { select: { id: true, nombre: true, duracion: true } },
  barbero: { select: { id: true, nombre: true } },
} as const;

function serializarTurnos(turnos: Prisma.turnoGetPayload<{ select: typeof SELECCION_TURNO_USUARIO }>[]): TurnoListado[] {
  return turnos.map((turno) => ({
    ...turno,
    precioCongelado: Number(turno.precioCongelado),
    seniaCongelada: Number(turno.seniaCongelada),
  }));
}

function filtroTurnosProximos(userId: string, ahora: Date): Prisma.turnoWhereInput {
  return {
    userId,
    estado: { in: [...ESTADOS_TURNO_ACTIVOS] },
    estadoPago: { in: [...ESTADOS_PAGO_VISIBLES_USUARIO] },
    horarioReservado: { gte: ahora },
  };
}

async function consultarHistorialTurnos(
  userId: string,
  paginaActual: number,
  ahora: Date,
): Promise<PaginaTurnosUsuario> {
  const filtro: Prisma.turnoWhereInput = {
    userId,
    estadoPago: { in: [...ESTADOS_PAGO_VISIBLES_USUARIO] },
    NOT: filtroTurnosProximos(userId, ahora),
  };

  const [turnos, total] = await Promise.all([
    prisma.turno.findMany({
      where: filtro,
      orderBy: { horarioReservado: "desc" },
      select: SELECCION_TURNO_USUARIO,
      skip: (paginaActual - 1) * TAMANIO_PAGINA,
      take: TAMANIO_PAGINA,
    }),
    prisma.turno.count({ where: filtro }),
  ]);

  return {
    turnos: serializarTurnos(turnos),
    paginaActual,
    totalPaginas: Math.max(1, Math.ceil(total / TAMANIO_PAGINA)),
  };
}

export async function getResumenTurnosUsuario(userId: string): Promise<ActionState<ResumenTurnosUsuario>> {
  if (typeof userId !== "string" || userId.length < 1 || userId.length > 191) {
    return { success: false, error: "Usuario inválido" };
  }

  try {
    if (!(await requerirPropietarioOAdmin(userId))) return { success: false, error: "No autorizado" };

    const ahora = new Date();
    const [historial, proximos] = await Promise.all([
      consultarHistorialTurnos(userId, 1, ahora),
      prisma.turno.findMany({
        where: filtroTurnosProximos(userId, ahora),
        orderBy: { horarioReservado: "asc" },
        select: SELECCION_TURNO_USUARIO,
      }),
    ]);

    return { success: true, data: { historial, proximos: serializarTurnos(proximos) } };
  } catch {
    return { success: false, error: "No se pudieron cargar los turnos" };
  }
}

export async function getUserTurnos(
  userId: string,
  paginaSolicitada: number = 1,
): Promise<ActionState<PaginaTurnosUsuario>> {
  try {
    // Solo el propio usuario (o un admin) puede ver sus turnos
    const sesionAutorizada = await requerirPropietarioOAdmin(userId);
    if (!sesionAutorizada) return { success: false, error: "No autorizado" };

    const paginaActual = Number.isInteger(paginaSolicitada) && paginaSolicitada > 0
      ? paginaSolicitada
      : 1;
    const data = await consultarHistorialTurnos(userId, paginaActual, new Date());
    return { success: true, data };
  } catch {
    return { success: false, error: "No se pudieron cargar los turnos" };
  }
}
