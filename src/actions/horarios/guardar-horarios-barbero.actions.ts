"use server";

import { prisma } from "@/lib/prisma";
import { validarRangosHorarios } from "@/lib/horarios/validar-rangos";
import { sincronizarDiaBarbero } from "@/lib/horarios/sincronizar-dia-barbero";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { revalidarDiasLaborales } from "@/lib/revalidar/revalidar-dias-laborales";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { Prisma } from "../../../generated/prisma/client";
import type { ActionState } from "@/types/action-state";
import type { HorarioDiaBarbero } from "@/types/horarios";

async function guardarHorariosBarberoBase(
  barberoId: string,
  dias: HorarioDiaBarbero[]
): Promise<ActionState<{ message: string }>> {
  try {
    if (!barberoId || dias.length === 0) {
      return { success: false, error: "Faltan datos para guardar los horarios." };
    }

    const barbero = await prisma.barbero.findUnique({
      where: { id: barberoId },
      select: { id: true },
    });
    if (!barbero) {
      return { success: false, error: "El empleado seleccionado no existe." };
    }

    const diasValidos = await prisma.dia_laboral.findMany({
      where: { id: { in: dias.map((d) => d.diaId) } },
      select: { id: true },
    });
    const idsValidos = new Set(diasValidos.map((d) => d.id));
    const diasFiltrados = dias.filter((d) => idsValidos.has(d.diaId));

    for (const d of diasFiltrados) {
      if (!d.trabaja) continue;
      const mensajeError = validarRangosHorarios(d.rangos);
      if (mensajeError) {
        return { success: false, error: mensajeError };
      }
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const d of diasFiltrados) {
        const asignacionesExistentes = await tx.margen_laboral_barbero.findMany({
          where: { barberoId, diaId: d.diaId },
          select: { id: true, margenLaboralId: true },
        });
        await sincronizarDiaBarbero(tx, barberoId, d, asignacionesExistentes);
      }
    });

    revalidarDiasLaborales(barberoId);
    revalidarBarberos();

    return { success: true, data: { message: "Horarios guardados correctamente" } };
  } catch (error) {
    console.error("Error al guardar horarios del barbero:", error);
    return { success: false, error: "Error al guardar los horarios" };
  }
}

export const guardarHorariosBarbero = exigirAdmin(guardarHorariosBarberoBase);
