"use server";

import { prisma } from "@/lib/prisma";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import { SELECCION_USUARIO_BASICA } from "@/lib/constants";
import {
  ESTADOS_PAGO_VISIBLES_USUARIO,
  ESTADOS_TURNO,
} from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type { TurnoListado } from "@/types/turno";

const TAMANIO_PAGINA = 20;

type PaginaTurnosUsuario = {
  turnos: TurnoListado[];
  paginaActual: number;
  totalPaginas: number;
};

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
    const filtro = {
      userId,
      estado: {
        in: [ESTADOS_TURNO[0], ESTADOS_TURNO[1], ESTADOS_TURNO[2]],
      },
      estadoPago: { in: [...ESTADOS_PAGO_VISIBLES_USUARIO] },
    };

    const [turnosRaw, total] = await Promise.all([
      prisma.turno.findMany({
        where: filtro,
        orderBy: { horarioReservado: "desc" },
        select: {
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
        },
        skip: (paginaActual - 1) * TAMANIO_PAGINA,
        take: TAMANIO_PAGINA,
      }),
      prisma.turno.count({ where: filtro }),
    ]);

    const turnos: TurnoListado[] = turnosRaw.map((t) => ({
      ...t,
      precioCongelado: Number(t.precioCongelado),
      seniaCongelada: Number(t.seniaCongelada),
    }));

    return {
      success: true,
      data: {
        turnos,
        paginaActual,
        totalPaginas: Math.max(1, Math.ceil(total / TAMANIO_PAGINA)),
      },
    };
  } catch (error) {
    console.error("Error fetching user turnos:", error);
    return { success: false, error: "No se pudieron cargar los turnos" };
  }
}
