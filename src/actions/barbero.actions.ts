"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success?: boolean;
  error?: string;
  data?: any;
};

/* =========================
   CREATE BARBERO
========================= */

export async function createBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const nombre = formData.get("nombre") as string;
    const srcImage = formData.get("srcImage") as string | null;

    if (!nombre) {
      return { success: false, error: "El nombre es obligatorio" };
    }

    const barbero = await prisma.barbero.create({
      data: {
        nombre,
        srcImage: srcImage || null,
        estado: true
      }
    });

    revalidatePath("/barberos");

    return { success: true, data: barbero };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear barbero" };
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
        srcImage: srcImage || null
      }
    });

    revalidatePath("/barberos");

    return { success: true, data: barbero };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al actualizar barbero" };
  }
}

/* =========================
   GET BARBEROS
========================= */

export async function getBarberos(): Promise<ActionState> {
  try {
    const barberos = await prisma.barbero.findMany({
      orderBy: { nombre: "asc" }
    });

    return { success: true, data: barberos };

  } catch (error) {
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
        servicios: true,
        margenes: {
          include: {
            dia: true
          }
        }
      }
    });

    if (!barbero) {
      return { success: false, error: "Barbero no encontrado" };
    }

    return { success: true, data: barbero };

  } catch (error) {
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
      data: { estado: false }
    });

    revalidatePath("/barberos");

    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar barbero" };
  }
}

/* =========================
   TOGGLE ESTADO
========================= */

export async function toggleEstadoBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    const estado = formData.get("estado") === "true";

    if (!id) {
      return { success: false, error: "ID no proporcionado" };
    }

    const barbero = await prisma.barbero.update({
      where: { id },
      data: { estado }
    });

    revalidatePath("/barberos");

    return { success: true, data: barbero };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al cambiar estado" };
  }
}
