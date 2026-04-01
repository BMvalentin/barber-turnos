"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { barberoSchema, updateBarberoSchema} from "@/lib/barbero-zod";

export type ActionState = {
  success?: boolean;
  error?: string;
  data?: any;
};

/* =========================
   CREATE BARBERO
========================= */
export async function createBarbero(data: unknown): Promise<ActionState> {
  try {
    const parsed = barberoSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(e => e.message).join(", "),
      };
    }

    const { nombre, srcImage, serviciosIds, margenesIds } = parsed.data;

    const nuevoBarbero = await prisma.barbero.create({
      data: {
        nombre,
        srcImage: srcImage || null,
        estado: true,
      },
    });

    if (serviciosIds?.length) {
      await prisma.servicioxbarbero.createMany({
        data: serviciosIds.map((id) => ({
          barberoId: nuevoBarbero.id,
          servicioId: id,
        })),
      });
    }

    if (margenesIds?.length) {
      const margenes = await prisma.margen_laboral.findMany({
        where: { id: { in: margenesIds } },
      });

      await prisma.margen_laboral_barbero.createMany({
        data: margenes.map((m) => ({
          barberoId: nuevoBarbero.id,
          margenLaboralId: m.id,
          diaId: m.diaId,
        })),
      });
    }

    revalidatePath("/barbero");

    // ✅ NO devolver Prisma crudo
    return { success: true };

  } catch (error) {
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
    const data = {
      id: formData.get("id"),
      nombre: formData.get("nombre"),
      srcImage: formData.get("srcImage"),
      estado: formData.get("estado") === "true",
    };

    const parsed = updateBarberoSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(e => e.message).join(", "),
      };
    }

    const { id, nombre, srcImage } = parsed.data;

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

    // 🔥 SERIALIZAR TODO lo que sea Decimal
    const data = barberos.map((b) => ({
      ...b,

      servicios: b.servicios.map((s) => ({
        ...s,
        servicio: {
          ...s.servicio,

          // 🔥 IMPORTANTE: todos los Decimal
          precio: s.servicio.precio
            ? Number(s.servicio.precio)
            : null,

          senia: s.servicio.senia
            ? Number(s.servicio.senia)
            : null,

          descuento: s.servicio.descuento
            ? Number(s.servicio.descuento)
            : null,
        },
      })),
    }));

    return { success: true, data };

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
    if (!id) {
      return { success: false, error: "ID requerido" };
    }

    const barbero = await prisma.barbero.findUnique({
      where: { id },
      include: {
        servicios: { include: { servicio: true } },
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
  formData: FormData
): Promise<void> {
  try {
    const id = formData.get("id");

    if (!id || typeof id !== "string") {
      throw new Error("ID inválido");
    }

    await prisma.barbero.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/barbero");

  } catch (error) {
    console.error("Error al eliminar barbero:", error);
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
    const barberoId = formData.get("barberoId");
    const servicioId = formData.get("servicioId");

    if (!barberoId || !servicioId) {
      return { success: false, error: "Datos incompletos" };
    }

    await prisma.servicioxbarbero.create({
      data: {
        barberoId: String(barberoId),
        servicioId: String(servicioId),
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
    const barberoId = formData.get("barberoId");
    const servicioId = formData.get("servicioId");

    await prisma.servicioxbarbero.deleteMany({
      where: {
        barberoId: String(barberoId),
        servicioId: String(servicioId),
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
    const barberoId = formData.get("barberoId");
    const margenLaboralId = formData.get("margenLaboralId");

    if (!barberoId || !margenLaboralId) {
      return { success: false, error: "Datos incompletos" };
    }

    const margen = await prisma.margen_laboral.findUnique({
      where: { id: String(margenLaboralId) },
    });

    if (!margen) {
      return { success: false, error: "Horario no encontrado" };
    }

    await prisma.margen_laboral_barbero.create({
      data: {
        barberoId: String(barberoId),
        margenLaboralId: margen.id,
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
    const id = formData.get("id");

    if (!id) {
      return { success: false, error: "ID requerido" };
    }

    await prisma.margen_laboral_barbero.delete({
      where: { id: String(id) },
    });

    revalidatePath("/barbero");

    return { success: true };

  } catch (error) {
    console.error("Error al remover horario:", error);
    return { success: false, error: "Error al remover horario" };
  }
}