"use server";

import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { ESTADOS_TURNO, ZONA_HORARIA } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state";
import type { Prisma } from "../../../generated/prisma/client";

export type EstadoTurnoCalendario = (typeof ESTADOS_TURNO)[number];

export type ResumenDiaCalendario = {
  total: number;
} & Record<EstadoTurnoCalendario, number>;

export type ResumenMensualCalendario = Record<string, ResumenDiaCalendario>;

const ESQUEMA_MES = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const ESQUEMA_BARBERO_ID = z.string().min(1).max(191);

function crearResumenDia(): ResumenDiaCalendario {
  return {
    total: 0,
    PENDIENTE: 0,
    CONFIRMADO: 0,
    COMPLETADO: 0,
    CANCELADO: 0,
  };
}

function mesSiguiente(anio: number, mes: number): string {
  const primerDiaSiguiente = new Date(anio, mes, 1);
  return `${primerDiaSiguiente.getFullYear()}-${String(primerDiaSiguiente.getMonth() + 1).padStart(2, "0")}`;
}

export async function obtenerResumenCalendario(
  mes: string,
  barberoIdFiltro?: string,
): Promise<ActionState<ResumenMensualCalendario>> {
  try {
    if (!ESQUEMA_MES.safeParse(mes).success) {
      return { success: false, error: "Mes inválido" };
    }
    if (barberoIdFiltro !== undefined && !ESQUEMA_BARBERO_ID.safeParse(barberoIdFiltro).success) {
      return { success: false, error: "Barbero inválido" };
    }

    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "No autorizado" };

    const contextoPanel = await requerirPanel();
    const usuarioEsAdmin = contextoPanel?.rol === "ADMIN";
    const [anio, mesNumero] = mes.split("-").map(Number);
    const inicio = fromZonedTime(`${mes}-01T00:00:00`, ZONA_HORARIA);
    const fin = fromZonedTime(`${mesSiguiente(anio, mesNumero)}-01T00:00:00`, ZONA_HORARIA);
    const where: Prisma.turnoWhereInput = {
      horarioReservado: { gte: inicio, lt: fin },
    };

    if (usuarioEsAdmin) {
      if (barberoIdFiltro) where.barberoId = barberoIdFiltro;
    } else if (contextoPanel?.rol === "EMPLEADO") {
      where.barberoId = contextoPanel.barberoId ?? "";
    } else {
      where.userId = session.user.id;
    }

    const turnos = await prisma.turno.findMany({
      where,
      select: { horarioReservado: true, estado: true },
    });
    const resumen: ResumenMensualCalendario = {};

    for (const turno of turnos) {
      const dia = obtenerFechaSola(turno.horarioReservado);
      const resumenDia = resumen[dia] ?? crearResumenDia();
      resumenDia.total += 1;
      resumenDia[turno.estado] += 1;
      resumen[dia] = resumenDia;
    }

    return { success: true, data: resumen };
  } catch {
    return { success: false, error: "Error al obtener el resumen del calendario" };
  }
}
