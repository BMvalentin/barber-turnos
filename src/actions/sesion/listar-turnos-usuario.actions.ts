"use server";

import { prisma } from "@/lib/prisma";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { ESTADOS_PAGO_ACREDITADOS } from "@/lib/constants";
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
      estadoPago: { in: [...ESTADOS_PAGO_ACREDITADOS] },
    };

    const [turnosRaw, total] = await Promise.all([
      prisma.turno.findMany({
        where: filtro,
        orderBy: { horarioReservado: "desc" },
        include: INCLUDE_TURNO_CON_DETALLE,
        skip: (paginaActual - 1) * TAMANIO_PAGINA,
        take: TAMANIO_PAGINA,
      }),
      prisma.turno.count({ where: filtro }),
    ]);

    const turnos: TurnoListado[] = turnosRaw.map((t) => ({
      ...t,
      precioCongelado: Number(t.precioCongelado),
      seniaCongelada: Number(t.seniaCongelada),
      servicio: t.servicio ? {
        ...t.servicio,
        precio: Number(t.servicio.precio),
        senia: Number(t.servicio.senia),
        descuento: Number(t.servicio.descuento),
      } : t.servicio,
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
