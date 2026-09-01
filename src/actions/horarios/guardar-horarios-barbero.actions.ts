"use server";

import { prisma } from "@/lib/prisma";
import { compararHoras } from "@/lib/horarios/comparar-horas";
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
      if (!d.desde || !d.hasta) {
        return { success: false, error: "Completá las horas de inicio y fin." };
      }
      if (compararHoras(d.hasta, d.desde) <= 0) {
        return { success: false, error: "La hora de fin debe ser posterior a la de inicio." };
      }
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const d of diasFiltrados) {
        const asignacionesExistentes = await tx.margen_laboral_barbero.findMany({
          where: { barberoId, diaId: d.diaId },
          select: { id: true, margenLaboralId: true },
        });
        if (!d.trabaja) {
          await tx.margen_laboral_barbero.deleteMany({
            where: { barberoId, diaId: d.diaId },
          });
          continue;
        }
        const margen = await tx.margen_laboral.findFirst({
          where: { diaId: d.diaId, desde: d.desde, hasta: d.hasta },
          select: { id: true },
        });
        let margenIdElegido = margen?.id;
        if (!margenIdElegido) {
          margenIdElegido = (await tx.margen_laboral.create({
            data: { diaId: d.diaId, desde: d.desde, hasta: d.hasta, estado: true },
            select: { id: true },
          })).id;
        } else {
          await tx.margen_laboral.update({ where: { id: margenIdElegido }, data: { estado: true } });
        }
        await tx.margen_laboral_barbero.deleteMany({
          where: { barberoId, diaId: d.diaId, margenLaboralId: { not: margenIdElegido } },
        });
        const asignacionExistente = asignacionesExistentes.find(
          (a) => a.margenLaboralId === margenIdElegido
        );
        if (asignacionExistente) {
          await tx.margen_laboral_barbero.update({
            where: { id: asignacionExistente.id },
            data: { estado: true },
          });
        } else {
          await tx.margen_laboral_barbero.create({
            data: { barberoId, margenLaboralId: margenIdElegido, diaId: d.diaId, estado: true },
          });
        }
      }
    });

    revalidarDiasLaborales();
    revalidarBarberos();

    return { success: true, data: { message: "Horarios guardados correctamente" } };
  } catch (error) {
    console.error("Error al guardar horarios del barbero:", error);
    return { success: false, error: "Error al guardar los horarios" };
  }
}

export const guardarHorariosBarbero = exigirAdmin(guardarHorariosBarberoBase);
