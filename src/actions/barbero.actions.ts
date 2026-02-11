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

  } catch (error : any ) {
    console.error(error);
    return {
      success: false,
      error: error?.message ?? "Error desconocido al crear barbero",
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
      where: { estado: true },
      include: {
        servicios: {
          include: {
            servicio: true
          }
        },
        horarios: {
          include: {
            dia: true
          }
        }
      },
      orderBy: { nombre: "asc" }
    });

    return { success: true, data: barberos };

  } catch (error) {
    console.error(error);
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
            servicio: true
          }
        },
        horarios: {
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
    console.error(error);
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

/* =========================
   ASIGNAR SERVICIO A BARBERO
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

    // Verificar que no exista ya la relación
    const existe = await prisma.servicioxbarbero.findFirst({
      where: {
        barberoId,
        servicioId
      }
    });

    if (existe) {
      return { success: false, error: "Este servicio ya está asignado al barbero" };
    }

    await prisma.servicioxbarbero.create({
      data: {
        barberoId,
        servicioId
      }
    });

    revalidatePath("/barberos");

    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al asignar servicio" };
  }
}

/* =========================
   REMOVER SERVICIO DE BARBERO
========================= */

export async function removerServicioDeBarbero(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const barberoId = formData.get("barberoId") as string;
    const servicioId = formData.get("servicioId") as string;

    if (!barberoId || !servicioId) {
      return { success: false, error: "Datos incompletos" };
    }

    await prisma.servicioxbarbero.deleteMany({
      where: {
        barberoId,
        servicioId
      }
    });

    revalidatePath("/barberos");

    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al remover servicio" };
  }
}


/* =========================
   GET HORARIOS DE UN BARBERO
========================= */

export async function getHorariosBarbero(barberoId: string): Promise<ActionState> {
  try {
    const horarios = await prisma.margen_laboral_barbero.findMany({
      where: { barberoId },
      include: {
        dia: true
      },
      orderBy: {
        dia: {
          dia: 'asc'
        }
      }
    });

    return { success: true, data: horarios };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al obtener horarios" };
  }
}

/* =========================
   GET SERVICIOS DE UN BARBERO
========================= */

export async function getServiciosBarbero(barberoId: string): Promise<ActionState> {
  try {
    const servicios = await prisma.servicioxbarbero.findMany({
      where: { barberoId },
      include: {
        servicio: true
      }
    });

    return { success: true, data: servicios };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al obtener servicios" };
  }
}

