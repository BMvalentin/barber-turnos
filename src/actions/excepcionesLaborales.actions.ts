"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success: boolean;
  error?: string;
  data?: any;
};

export async function createExcepcion(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const motivo = formData.get("motivo") as string;
    const desde = formData.get("desde") as string;
    const hasta = formData.get("hasta") as string;

    if (!motivo || !desde || !hasta) {
      return {
        success: false,
        error: "Todos los campos son requeridos",
      };
    }

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

export async function softDeleteExcepcion(id: string): Promise<void> {
  try {
    await prisma.excepcion_laboral.update({
      where: { id },
      data: { estado: false },
    });

    revalidatePath("/excepcionesLaborales");
  } catch (error) {
    console.error("Error al desactivar excepción:", error);
    throw new Error("Error al desactivar la excepción");
  }
}