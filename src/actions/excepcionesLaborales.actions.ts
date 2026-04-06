"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { excepcionSchema } from "@/lib/excepcion-zod";

export type ActionState = {
  success: boolean;
  error?: string;
};

export async function createExcepcion(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = {
      motivo: formData.get("motivo"),
      desde: formData.get("desde"),
      hasta: formData.get("hasta"),
    };

    const parsed = excepcionSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(e => e.message).join(", "),
      };
    }

    const { motivo, desde, hasta } = parsed.data;

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

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
        estado: true,
      },
    });

    revalidatePath("/excepcionesLaborales");

    return { success: true };

  } catch (error) {
    console.error("Error al crear excepción:", error);
    return {
      success: false,
      error: "Error al crear la excepción",
    };
  }
}

export async function softDeleteExcepcion(
  formData: FormData
): Promise<void> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("ID requerido");
    }

    await prisma.excepcion_laboral.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/excepcionesLaborales");

  } catch (error) {
    console.error("Error al desactivar excepción:", error);
  }
}