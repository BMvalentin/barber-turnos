"use server";

import { prisma } from "@/lib/prisma";
import { excepcionSchema } from "@/lib/excepcion-zod";
import { fromZonedTime } from "date-fns-tz";
import { ZONA_HORARIA } from "@/lib/constants";
import { revalidarExcepciones } from "@/lib/revalidar/revalidar-excepciones";

import type { ActionState } from "@/types/action-state";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function createExcepcionBase(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = {
      motivo: formData.get("motivo"),
      desde: formData.get("desde"),
      hasta: formData.get("hasta"),
      barberoId: formData.get("barberoId") || null,
    };

    const parsed = excepcionSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(e => e.message).join(", "),
      };
    }

    const { motivo, desde, hasta, barberoId } = parsed.data;

    // Convertir entrada local a UTC para la base de datos
    const fechaDesde = fromZonedTime(desde, ZONA_HORARIA);
    const fechaHasta = fromZonedTime(hasta, ZONA_HORARIA);

    if (fechaHasta < fechaDesde) {
      return {
        success: false,
        error: "La fecha 'hasta' debe ser posterior a la fecha 'desde'",
      };
    }

    await prisma.excepcion_laboral.create({
      data: {
        motivo,
        desde: fechaDesde,
        hasta: fechaHasta,
        barberoId: barberoId || null,
        estado: true,
      },
    });

    revalidarExcepciones(barberoId);

    return { success: true };

  } catch (error) {
    console.error("Error al crear excepción:", error);
    return {
      success: false,
      error: "Error al crear la excepción",
    };
  }
}

export const createExcepcion = exigirAdmin(createExcepcionBase);
