"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MAP_DIA_SEMANA, REVERSE_MAP_DIA_SEMANA } from "@/lib/constants";

import type { ActionState } from "@/types/action-state";
import type { DiaLaboralCreado } from "@/types/horarios";
import { requerirAdmin } from "@/lib/seguridad";
import type {
  Prisma,
  dias_laborales,
} from "../../../generated/prisma/client";

type DiaLaboralConMargenes = Prisma.dia_laboralGetPayload<{
  include: { margenes: true };
}>;

// Crear día laboral
export async function create(
  prevState: ActionState<DiaLaboralCreado>,
  formData: FormData
): Promise<ActionState<DiaLaboralCreado>> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const dia = parseInt(formData.get("dia") as string);
    const diaEnum = MAP_DIA_SEMANA[dia];
    const estado = formData.get("estado") === "true";

    // Verificar si ya existe
    const existing = await prisma.dia_laboral.findFirst({
      where: { dia: diaEnum as dias_laborales },
    });

    if (existing) {
      return {
        success: false,
        error: "Ya existe un registro para este día de la semana",
      };
    }

    const diaLaboral = await prisma.dia_laboral.create({
      data: {
        dia: diaEnum as dias_laborales,
        estado,
      },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: {
        ...diaLaboral,
        dia: REVERSE_MAP_DIA_SEMANA[diaLaboral.dia]
      },
    };
  } catch (error) {
    console.error("Error al crear día laboral:", error);
    return {
      success: false,
      error: "Error al crear el día laboral",
    };
  }
}

// Actualizar día laboral
export async function update(
  prevState: ActionState<DiaLaboralCreado>,
  formData: FormData
): Promise<ActionState<DiaLaboralCreado>> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const id = formData.get("id") as string;
    const dia = parseInt(formData.get("dia") as string);
    const diaEnum = MAP_DIA_SEMANA[dia];
    const estado = formData.get("estado") === "true";

    // Verificar si existe
    const existing = await prisma.dia_laboral.findUnique({
      where: { id },
    });


    // Verificar conflictos con otros días
    const conflict = await prisma.dia_laboral.findFirst({
      where: {
        dia: diaEnum as dias_laborales,
        id: { not: id },
      },
    });

    if (conflict) {
      return {
        success: false,
        error: "Ya existe un registro para este día de la semana",
      };
    }

    const diaLaboral = await prisma.dia_laboral.update({
      where: { id },
      data: {
        dia: diaEnum as dias_laborales,
        estado,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: {
        ...diaLaboral,
        dia: REVERSE_MAP_DIA_SEMANA[diaLaboral.dia]
      },
    };
  } catch (error) {
    console.error("Error al actualizar día laboral:", error);
    return {
      success: false,
      error: "Error al actualizar el día laboral",
    };
  }
}

// Eliminar día laboral
export async function deleteDiaLaboral(id: string): Promise<ActionState<{ message: string }>> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    // Verificar si existe y tiene márgenes
    const existing = await prisma.dia_laboral.findUnique({
      where: { id },
      include: {
        margenes: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Día laboral no encontrado",
      };
    }

    if (existing.margenes.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar. El día tiene márgenes asociados",
      };
    }

    await prisma.dia_laboral.delete({
      where: { id },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: { message: "Día laboral eliminado correctamente" },
    };
  } catch (error) {
    console.error("Error al eliminar día laboral:", error);
    return {
      success: false,
      error: "Error al eliminar el día laboral",
    };
  }
}

// Obtener todos los días laborales
export async function getDiasLaborales() {
  try {
    const diasEnDb = await prisma.dia_laboral.findMany({
      include: {
        margenes: {
          orderBy: { desde: "asc" },
        },
      },
      orderBy: {
        dia: "asc",
      },
    });

    const formatDia = (d: DiaLaboralConMargenes) => ({
      ...d,
      dia: REVERSE_MAP_DIA_SEMANA[d.dia]
    });

    // Si faltan días, los creamos como activos por defecto
    if (diasEnDb.length < 7) {
      const idsExistentes = diasEnDb.map((d) => REVERSE_MAP_DIA_SEMANA[d.dia]);
      const diasFaltantes = [0, 1, 2, 3, 4, 5, 6].filter((id) => !idsExistentes.includes(id));

      if (diasFaltantes.length > 0) {
        await prisma.dia_laboral.createMany({
          data: diasFaltantes.map((diaIndex) => ({
            dia: MAP_DIA_SEMANA[diaIndex] as dias_laborales,
            estado: true,
          })),
        });

        // Retornamos la lista completa actualizada
        const updatedDias = await prisma.dia_laboral.findMany({
          include: {
            margenes: {
              orderBy: { desde: "asc" },
            },
          },
        });
        
        return updatedDias.map(formatDia).sort((a, b) => a.dia - b.dia);
      }
    }

    return diasEnDb.map(formatDia).sort((a, b) => a.dia - b.dia);
  } catch (error) {
    console.error("Error al obtener días laborales:", error);
    throw new Error("Error al obtener los días laborales");
  }
}


// Obtener un día laboral por ID
export async function getDiaLaboralById(id: string) {
  try {
    const diaLaboral = await prisma.dia_laboral.findUnique({
      where: { id },
      include: {
        margenes: true,
      },
    });

    if (!diaLaboral) return null;

    return {
      ...diaLaboral,
      dia: REVERSE_MAP_DIA_SEMANA[diaLaboral.dia]
    };
  } catch (error) {
    console.error("Error al obtener día laboral:", error);
    throw new Error("Error al obtener el día laboral");
  }
}