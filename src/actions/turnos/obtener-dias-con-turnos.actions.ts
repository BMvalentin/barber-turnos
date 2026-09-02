"use server";

import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { ZONA_HORARIA } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state";
import type { Prisma, turno_estado } from "../../../generated/prisma/client";

const REGEX_MES = /^\d{4}-\d{2}$/;

function formatearMesSiguiente(anio: number, mes: number): string {
  const primerDiaSiguiente = new Date(anio, mes, 1);
  return `${primerDiaSiguiente.getFullYear()}-${String(primerDiaSiguiente.getMonth() + 1).padStart(2, "0")}`;
}

export async function obtenerDiasConTurnos(
  mes: string,
  estadoFiltro?: string,
): Promise<ActionState<string[]>> {
  try {
    if (!REGEX_MES.test(mes)) {
      return { success: false, error: "Mes inválido" };
    }

    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "No autorizado" };

    const [anio, mesNumero] = mes.split("-").map(Number);
    const inicio = fromZonedTime(`${mes}-01T00:00:00`, ZONA_HORARIA);
    const fin = fromZonedTime(`${formatearMesSiguiente(anio, mesNumero)}-01T00:00:00`, ZONA_HORARIA);

    const usuarioEsAdmin = Boolean(await requerirAdmin());
    const where: Prisma.turnoWhereInput = { horarioReservado: { gte: inicio, lt: fin } };

    if (!usuarioEsAdmin) where.userId = session.user.id;
    if (estadoFiltro && estadoFiltro !== "TODOS") where.estado = estadoFiltro as turno_estado;

    const turnos = await prisma.turno.findMany({
      where,
      select: { horarioReservado: true },
    });

    const dias = Array.from(new Set(turnos.map((t) => obtenerFechaSola(t.horarioReservado))));
    return { success: true, data: dias };
  } catch (error) {
    return { success: false, error: "Error al obtener los días con turnos" };
  }
}
