"use server";

import { z } from "zod";
import { obtenerDisponibilidadMensualCacheada } from "@/lib/disponibilidad-mensual-cacheada";
import { filtrarSlotsVigentes } from "@/lib/turnos/filtrar-slots-vigentes";
import type { ActionState } from "@/types/action-state";

const MES_VALIDO = /^\d{4}-(0[1-9]|1[0-2])$/;
const esquemaConsulta = z.object({
  mes: z.string().regex(MES_VALIDO),
  servicioId: z.string().min(1).max(191),
  barberoId: z.string().min(1).max(191),
  turnoIdAExcluir: z.string().min(1).max(191).optional(),
});

export async function obtenerDiasDisponibles(
  mes: string,
  servicioId: string,
  barberoId: string,
  turnoIdAExcluir?: string,
): Promise<ActionState<{ dias: string[]; horarios: Record<string, string[]> }>> {

  try {
    const datos = esquemaConsulta.safeParse({ mes, servicioId, barberoId, turnoIdAExcluir });
    if (!datos.success) {
      return { success: false, error: "Parámetros de disponibilidad inválidos" };
    }
    const disponibilidad = await obtenerDisponibilidadMensualCacheada(
      datos.data.mes, datos.data.servicioId, datos.data.barberoId, datos.data.turnoIdAExcluir,
    );
    const ahora = Date.now();
    const horarios = Object.fromEntries(
      Object.entries(disponibilidad).map(([fecha, slots]) => [fecha, filtrarSlotsVigentes(slots, ahora)]),
    );
    const dias = Object.entries(horarios)
      .filter(([, slots]) => slots.length > 0)
      .map(([fecha]) => fecha);
    return { success: true, data: { dias, horarios } };
  } catch {
    return { success: false, error: "Error al calcular disponibilidad" };
  }
}
