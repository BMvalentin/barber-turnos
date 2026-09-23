"use server";

import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { ESTADOS_TURNO, ZONA_HORARIA } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state";
import type { Prisma, turno_estado } from "../../../generated/prisma/client";

function esEstadoTurno(valor: string): valor is turno_estado {
  return ESTADOS_TURNO.some((estado) => estado === valor);
}

const REGEX_MES = /^\d{4}-\d{2}$/;

function formatearMesSiguiente(anio: number, mes: number): string {
  const primerDiaSiguiente = new Date(anio, mes, 1);
  return `${primerDiaSiguiente.getFullYear()}-${String(primerDiaSiguiente.getMonth() + 1).padStart(2, "0")}`;
}

export async function obtenerDiasConTurnos(
  mes: string,
  estadoFiltro?: string,
  barberoIdFiltro?: string,
): Promise<ActionState<string[]>> {
  try {
    if (!REGEX_MES.test(mes)) {
      return { success: false, error: "Mes inválido" };
    }
    if (estadoFiltro && estadoFiltro !== "TODOS" && !esEstadoTurno(estadoFiltro)) {
      return { success: false, error: "Estado inválido" };
    }
    const estadoValido = estadoFiltro && estadoFiltro !== "TODOS" && esEstadoTurno(estadoFiltro)
      ? estadoFiltro
      : undefined;

    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "No autorizado" };

    const [anio, mesNumero] = mes.split("-").map(Number);
    const inicio = fromZonedTime(`${mes}-01T00:00:00`, ZONA_HORARIA);
    const fin = fromZonedTime(`${formatearMesSiguiente(anio, mesNumero)}-01T00:00:00`, ZONA_HORARIA);

    const contextoPanel = await requerirPanel();
    const usuarioEsAdmin = contextoPanel?.rol === "ADMIN";
    const where: Prisma.turnoWhereInput = { horarioReservado: { gte: inicio, lt: fin } };

    if (usuarioEsAdmin) {
      if (barberoIdFiltro) where.barberoId = barberoIdFiltro;
    } else if (contextoPanel?.rol === "EMPLEADO") {
      where.barberoId = contextoPanel.barberoId ?? "";
    } else {
      where.userId = session.user.id;
    }
    if (estadoValido) where.estado = estadoValido;

    const turnos = await prisma.turno.findMany({
      where,
      select: { horarioReservado: true },
    });

    const dias = Array.from(new Set(turnos.map((t) => obtenerFechaSola(t.horarioReservado))));
    return { success: true, data: dias };
  } catch {
    return { success: false, error: "Error al obtener los días con turnos" };
  }
}
