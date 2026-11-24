"use server";

import { z } from "zod";
import { obtenerCapacidadMensualCacheada } from "@/lib/disponibilidad-mensual-cacheada";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import type { CapacidadHoraria } from "@/lib/turnos/capacidad-horaria";
import type { ActionState } from "@/types/action-state";

const MES_VALIDO = /^[1-9]\d{3}-(0[1-9]|1[0-2])$/;
const esquemaConsulta = z.object({
  mes: z.string().regex(MES_VALIDO),
  barberoId: z.string().min(1).max(191),
  turnoIdAExcluir: z.string().min(1).max(191).optional(),
});

export async function obtenerCapacidadMensual(
  mes: string,
  barberoId: string,
  turnoIdAExcluir?: string,
): Promise<ActionState<CapacidadHoraria>> {

  try {
    const datos = esquemaConsulta.safeParse({ mes, barberoId, turnoIdAExcluir });
    if (!datos.success) {
      return { success: false, error: "Parámetros de disponibilidad inválidos" };
    }
    const consulta = datos.data;
    if (consulta.turnoIdAExcluir && !(await requerirAdmin())) {
      return { success: false, error: "No autorizado" };
    }
    const capacidad = await obtenerCapacidadMensualCacheada(
      consulta.mes, consulta.barberoId, consulta.turnoIdAExcluir,
    );
    return { success: true, data: capacidad };
  } catch {
    return { success: false, error: "Error al calcular disponibilidad" };
  }
}
