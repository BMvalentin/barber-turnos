"use server";

import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { ESTADOS_TURNO, SELECCION_USUARIO_BASICA } from "@/lib/constants";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";
import type { Prisma, turno_estado } from "../../../generated/prisma/client";
import type { ActionState } from "@/types/action-state";
import type { TurnoListado } from "@/types/turno";
import { z } from "zod";

const SELECT_TURNO_LISTADO = {
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
} satisfies Prisma.turnoSelect;

const ESQUEMA_MES_AGENDA = z.string().length(7).regex(/^[1-9]\d{3}-(0[1-9]|1[0-2])$/);

function esEstadoTurno(valor: string): valor is turno_estado {
  return ESTADOS_TURNO.some((estado) => estado === valor);
}

export async function getTurnos(page: number = 1, estadoFiltro?: string, fechaFiltro?: string, barberoIdFiltro?: string) {
  try {
    if (!Number.isInteger(page) || page < 1) return { success: false, error: "Página inválida" };
    if (estadoFiltro && estadoFiltro !== "TODOS" && !esEstadoTurno(estadoFiltro)) {
      return { success: false, error: "Estado inválido" };
    }
    const estadoValido = estadoFiltro && estadoFiltro !== "TODOS" && esEstadoTurno(estadoFiltro)
      ? estadoFiltro
      : undefined;
    if (fechaFiltro && !z.iso.date().safeParse(fechaFiltro).success) {
      return { success: false, error: "Fecha inválida" };
    }
    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "No autorizado" };

    const contextoPanel = await requerirPanel();
    const usuarioEsAdmin = contextoPanel?.rol === "ADMIN";
    /* Páginas de 10 turnos: alimenta el scroll infinito de la vista de turnos. */
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.turnoWhereInput = {};

    if (usuarioEsAdmin) {
      if (barberoIdFiltro) where.barberoId = barberoIdFiltro;
    } else if (contextoPanel?.rol === "EMPLEADO") {
      where.barberoId = contextoPanel.barberoId ?? "";
    } else {
      where.userId = session.user.id;
    }
    if (estadoValido) where.estado = estadoValido;

    // Filtrado por fecha (convierte el string 'YYYY-MM-DD' a rango)
    if (fechaFiltro) {
      const { inicio, fin } = obtenerRangoDelDia(fechaFiltro);
      where.horarioReservado = {
        gte: inicio,
        lte: fin,
      };
    }

    const [turnos, totalCount] = await Promise.all([
      prisma.turno.findMany({
        where,
        skip,
        take: pageSize,
        select: SELECT_TURNO_LISTADO,
        orderBy: { horarioReservado: "desc" },
      }),
      prisma.turno.count({ where })
    ]);

    const data = turnos.map((t) => ({
      ...t,
      precioCongelado: Number(t.precioCongelado),
      seniaCongelada: Number(t.seniaCongelada),
    }));

    return {
      success: true,
      data,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page
    };

  } catch {
    return { success: false, error: "Error al obtener turnos" };
  }
}

/** Devuelve los turnos de un mes para la agenda del panel. */
export async function obtenerTurnosDelMes(mes: string): Promise<ActionState<TurnoListado[]>> {
  try {
    if (!ESQUEMA_MES_AGENDA.safeParse(mes).success) {
      return { success: false, error: "Mes inválido" };
    }

    const contextoPanel = await requerirPanel();
    if (!contextoPanel || (contextoPanel.rol === "EMPLEADO" && !contextoPanel.barberoId)) {
      return { success: false, error: "No autorizado" };
    }

    const [anio, numeroMes] = mes.split("-").map(Number);
    const [primerDiaMesSiguiente] = new Date(Date.UTC(anio, numeroMes, 1)).toISOString().split("T");
    const turnos = await prisma.turno.findMany({
      where: {
        ...(contextoPanel.rol === "EMPLEADO" ? { barberoId: contextoPanel.barberoId ?? "" } : {}),
        horarioReservado: {
          gte: obtenerRangoDelDia(`${mes}-01`).inicio,
          lt: obtenerRangoDelDia(primerDiaMesSiguiente).inicio,
        },
      },
      select: SELECT_TURNO_LISTADO,
      orderBy: [{ horarioReservado: "desc" }, { id: "desc" }],
    });

    return {
      success: true,
      data: turnos.map((turno) => ({
        ...turno,
        precioCongelado: Number(turno.precioCongelado),
        seniaCongelada: Number(turno.seniaCongelada),
      })),
    };
  } catch {
    return { success: false, error: "Error al obtener los turnos" };
  }
}
