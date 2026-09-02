"use server";

import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { revalidarServicios } from "@/lib/revalidar/revalidar-servicios";
import type { ActionState } from "@/types/action-state";

const deleteservicioBase = async (
  formData: FormData,
): Promise<ActionState<{ id: string }>> => {
  try {
    const id = formData.get("id") as string;

    if (!id || id.trim() === "") {
      return {
        error: "ID del servicio es requerido",
        success: false,
      };
    }

    const servicioConTurnos = await prisma.servicio.findUnique({
      where: { id },
      include: {
        turnos: true,
      },
    });

    if (!servicioConTurnos) {
      return { error: "Servicio no encontrado", success: false };
    }

    if (servicioConTurnos.turnos.length > 0) {
      return {
        error: "No se puede eliminar: tiene turnos asociados",
        success: false,
      };
    }

    await prisma.servicio.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidarServicios(id);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return {
      success: false,
      error: "No se pudo eliminar el servicio. Intentalo de nuevo.",
    };
  }
};

export const deleteservicio = exigirAdmin(deleteservicioBase);
