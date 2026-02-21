"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success?: boolean;
  error?: string;
  data?: any;
};

type CreateBarberoInput = {
  nombre: string;
  srcImage?: string | null;
  serviciosIds: string[];
  margenesIds: string[];
};

/* =========================
   CREATE BARBERO (CON SERVICIOS + HORARIOS)
========================= */

export async function createBarbero(data: CreateBarberoInput): Promise<ActionState> {
  try {
    const { nombre, srcImage, serviciosIds, margenesIds } = data;

    // Crear el barbero
    const nuevoBarbero = await prisma.barbero.create({
      data: {
        nombre,
        srcImage: srcImage || null,
        estado: true,
      },
    });

    // Asignar servicios (crear registros en tabla intermedia)
    if (serviciosIds && serviciosIds.length > 0) {
      await prisma.servicioxbarbero.createMany({
        data: serviciosIds.map((servicioId) => ({
          barberoId: nuevoBarbero.id,
          servicioId,
        })),
      });
    }

    // Asignar horarios (crear registros en tabla intermedia)
    if (margenesIds && margenesIds.length > 0) {
      // Obtener los márgenes para saber a qué día pertenecen
      const margenes = await prisma.margen_laboral.findMany({
        where: {
          id: { in: margenesIds },
        },
      });

      await prisma.margen_laboral_barbero.createMany({
        data: margenes.map((margen) => ({
          barberoId: nuevoBarbero.id,
          margenLaboralId: margen.id,
          diaId: margen.diaId,
        })),
      });
    }

    revalidatePath("/barbero");

    return { success: true, data: nuevoBarbero };
  } catch (error) {
    console.error("Error al crear barbero:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al crear barbero" 
    };
  }
}

/* =========================
   UPDATE BARBERO
========================= */

export async function updateBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    const nombre = formData.get("nombre") as string;
    const srcImage = formData.get("srcImage") as string | null;

    if (!id || !nombre) {
      return { success: false, error: "Datos incompletos" };
    }

    const barbero = await prisma.barbero.update({
      where: { id },
      data: {
        nombre,
        srcImage: srcImage || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/barbero");

    return { success: true, data: barbero };
  } catch (error) {
    console.error("Error al actualizar barbero:", error);
    return { success: false, error: "Error al actualizar barbero" };
  }
}

/* =========================
   GET BARBEROS
========================= */

export async function getBarberos(): Promise<ActionState> {
  try {
    const barberos = await prisma.barbero.findMany({
      where: { estado: true },
      include: {
        servicios: {
          include: {
            servicio: true,
          },
        },
        horarios: {
          include: {
            dia: true,
            margenLaboral: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    return { success: true, data: barberos };
  } catch (error) {
    console.error("Error al obtener barberos:", error);
    return { success: false, error: "Error al obtener barberos" };
  }
}

/* =========================
   GET BARBERO BY ID
========================= */

export async function getBarberoById(id: string): Promise<ActionState> {
  try {
    const barbero = await prisma.barbero.findUnique({
      where: { id },
      include: {
        servicios: {
          include: {
            servicio: true,
          },
        },
        horarios: {
          include: {
            dia: true,
            margenLaboral: true,
          },
        },
      },
    });

    if (!barbero) {
      return { success: false, error: "Barbero no encontrado" };
    }

    return { success: true, data: barbero };
  } catch (error) {
    console.error("Error al obtener barbero:", error);
    return { success: false, error: "Error al obtener barbero" };
  }
}

/* =========================
   DELETE (SOFT)
========================= */

export async function deleteBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID no proporcionado" };
    }

    await prisma.barbero.update({
      where: { id },
      data: { 
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar barbero:", error);
    return { success: false, error: "Error al eliminar barbero" };
  }
}

/* =========================
   ASIGNAR SERVICIO
========================= */

export async function asignarServicioABarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const barberoId = formData.get("barberoId") as string;
    const servicioId = formData.get("servicioId") as string;

    if (!barberoId || !servicioId) {
      return { success: false, error: "Datos incompletos" };
    }

    await prisma.servicioxbarbero.create({
      data: {
        barberoId,
        servicioId,
      },
    });

    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al asignar servicio:", error);
    return { success: false, error: "Error al asignar servicio" };
  }
}

/* =========================
   REMOVER SERVICIO
========================= */

export async function removerServicioDeBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const barberoId = formData.get("barberoId") as string;
    const servicioId = formData.get("servicioId") as string;

    await prisma.servicioxbarbero.deleteMany({
      where: {
        barberoId,
        servicioId,
      },
    });

    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al remover servicio:", error);
    return { success: false, error: "Error al remover servicio" };
  }
}

/* =========================
   ASIGNAR HORARIO
========================= */

export async function asignarHorarioABarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const barberoId = formData.get("barberoId") as string;
    const margenLaboralId = formData.get("margenLaboralId") as string;

    const margen = await prisma.margen_laboral.findUnique({
      where: { id: margenLaboralId },
    });

    if (!margen) {
      return { success: false, error: "Horario no encontrado" };
    }

    await prisma.margen_laboral_barbero.create({
      data: {
        barberoId,
        margenLaboralId,
        diaId: margen.diaId,
      },
    });

    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al asignar horario:", error);
    return { success: false, error: "Error al asignar horario" };
  }
}

/* =========================
   REMOVER HORARIO
========================= */

export async function removerHorarioDeBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;

    await prisma.margen_laboral_barbero.delete({
      where: { id },
    });

    revalidatePath("/barbero");

    return { success: true };
  } catch (error) {
    console.error("Error al remover horario:", error);
    return { success: false, error: "Error al remover horario" };
  }
}