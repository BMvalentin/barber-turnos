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

const esquemaHora = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const esquemaHorarios = z.object({
  barberoId: z.string().min(1),
  dias: z.array(z.object({
    diaId: z.string().min(1),
    trabaja: z.boolean(),
    rangos: z.array(z.object({ desde: esquemaHora, hasta: esquemaHora })),
  })),
});

type AsignacionHorario = {
  id: string;
  diaId: string;
  margenLaboralId: string;
  estado: boolean;
  margenLaboral: { desde: string; hasta: string; estado: boolean };
};

function diaSinCambios(dia: HorarioDiaBarbero, asignaciones: AsignacionHorario[]): boolean {
  if (!dia.trabaja) return asignaciones.length === 0;
  if (asignaciones.length !== dia.rangos.length) return false;

  const rangos = new Set(dia.rangos.map(({ desde, hasta }) => `${desde}\u0000${hasta}`));
  const rangosActuales = new Set(asignaciones.map(({ margenLaboral }) =>
    `${margenLaboral.desde}\u0000${margenLaboral.hasta}`
  ));
  if (rangosActuales.size !== asignaciones.length) return false;
  return asignaciones.every((asignacion) =>
    asignacion.estado &&
    asignacion.margenLaboral.estado &&
    rangos.has(`${asignacion.margenLaboral.desde}\u0000${asignacion.margenLaboral.hasta}`)
  );
}

async function guardarHorariosBarberoBase(
  barberoId: string,
  dias: HorarioDiaBarbero[]
): Promise<ActionState<{ message: string; actualizado: boolean }>> {
  try {
    const datos = esquemaHorarios.safeParse({ barberoId, dias });
    if (!datos.success) return { success: false, error: "Datos de horarios inválidos" };
    const diasValidados = datos.data.dias;
    const contexto = await requerirPanel();
    if (!contexto) return { success: false, error: "No autorizado" };
    const idBarbero = contexto.rol === "EMPLEADO"
      ? contexto.barberoId
      : datos.data.barberoId;
    if (!idBarbero) {
      return { success: false, error: "No autorizado" };
    }
    if (diasValidados.length === 0) {
      return { success: false, error: "Faltan datos para guardar los horarios." };
    }
    const idsDias = diasValidados.map((dia) => dia.diaId);
    if (new Set(idsDias).size !== idsDias.length) {
      return { success: false, error: "Hay días repetidos en los horarios." };
    }

    const [barbero, diasValidos] = await Promise.all([
      prisma.barbero.findUnique({
        where: { id: idBarbero },
        select: { id: true },
      }),
      prisma.dia_laboral.findMany({
        where: { id: { in: idsDias } },
        select: { id: true },
      }),
    ]);
    if (!barbero) {
      return { success: false, error: "El empleado seleccionado no existe." };
    }

    const idsValidos = new Set(diasValidos.map((d) => d.id));
    const diasFiltrados = diasValidados.filter((d) => idsValidos.has(d.diaId));

    for (const d of diasFiltrados) {
      if (!d.trabaja) continue;
      const mensajeError = validarRangosHorarios(d.rangos);
      if (mensajeError) {
        return { success: false, error: mensajeError };
      }
    }

    const huboCambios = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        let actualizado = false;
        const asignaciones = await tx.margen_laboral_barbero.findMany({
          where: { barberoId: idBarbero, diaId: { in: diasFiltrados.map((dia) => dia.diaId) } },
          select: {
            id: true,
            diaId: true,
            margenLaboralId: true,
            estado: true,
            margenLaboral: { select: { desde: true, hasta: true, estado: true } },
          },
        });
        for (const d of diasFiltrados) {
          const asignacionesExistentes = asignaciones.filter((asignacion) => asignacion.diaId === d.diaId);
          if (diaSinCambios(d, asignacionesExistentes)) continue;
          await sincronizarDiaBarbero(tx, idBarbero, d, asignacionesExistentes);
          actualizado = true;
        }
        return actualizado;
      },
      // Sincronizar varios días puede requerir más de los 5 s por defecto
      // cuando la base de datos está alojada fuera del entorno local.
      { timeout: 15_000 },
    );

    if (huboCambios) {
      revalidarDiasLaborales(idBarbero);
      revalidarBarberos();
    }

    return { success: true, data: { message: "Horarios guardados correctamente", actualizado: huboCambios } };
  } catch (error) {
    console.error("Error al guardar horarios del barbero:", error);
    return { success: false, error: "Error al guardar los horarios" };
  }
}

export const guardarHorariosBarbero = guardarHorariosBarberoBase;
