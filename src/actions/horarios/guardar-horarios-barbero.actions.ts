"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { validarRangosHorarios } from "@/lib/horarios/validar-rangos";
import { sincronizarDiaBarbero } from "@/lib/horarios/sincronizar-dia-barbero";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { revalidarDiasLaborales } from "@/lib/revalidar/revalidar-dias-laborales";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { Prisma } from "../../../generated/prisma/client";
import type { ActionState } from "@/types/action-state";
import type { HorarioDiaBarbero } from "@/types/horarios";

const esquemaHorarios = z.object({
  barberoId: z.string().min(1),
  dias: z.array(z.object({
    diaId: z.string().min(1),
    trabaja: z.boolean(),
    rangos: z.array(z.object({ desde: z.string(), hasta: z.string() })),
  })),
});

async function guardarHorariosBarberoBase(
  barberoId: string,
  dias: HorarioDiaBarbero[]
): Promise<ActionState<{ message: string }>> {
  try {
    const datos = esquemaHorarios.safeParse({ barberoId, dias });
    if (!datos.success) return { success: false, error: "Datos de horarios inválidos" };
    const idBarbero = datos.data.barberoId;
    const diasValidados = datos.data.dias;
    const contexto = await requerirPanel();
    if (!contexto) return { success: false, error: "No autorizado" };
    if (contexto.rol === "EMPLEADO" && contexto.barberoId !== idBarbero) {
      return { success: false, error: "No autorizado" };
    }
    if (diasValidados.length === 0) {
      return { success: false, error: "Faltan datos para guardar los horarios." };
    }

    const barbero = await prisma.barbero.findUnique({
      where: { id: idBarbero },
      select: { id: true },
    });
    if (!barbero) {
      return { success: false, error: "El empleado seleccionado no existe." };
    }

    const diasValidos = await prisma.dia_laboral.findMany({
      where: { id: { in: diasValidados.map((d) => d.diaId) } },
      select: { id: true },
    });
    const idsValidos = new Set(diasValidos.map((d) => d.id));
    const diasFiltrados = diasValidados.filter((d) => idsValidos.has(d.diaId));

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
          where: { barberoId: idBarbero, diaId: d.diaId },
          select: { id: true, margenLaboralId: true },
        });
        await sincronizarDiaBarbero(tx, idBarbero, d, asignacionesExistentes);
      }
    });

    revalidarDiasLaborales(idBarbero);
    revalidarBarberos();

    return { success: true, data: { message: "Horarios guardados correctamente" } };
  } catch (error) {
    console.error("Error al guardar horarios del barbero:", error);
    return { success: false, error: "Error al guardar los horarios" };
  }
}

export const guardarHorariosBarbero = guardarHorariosBarberoBase;
