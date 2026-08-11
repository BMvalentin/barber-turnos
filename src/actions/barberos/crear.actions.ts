"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { barberoSchema } from "@/lib/barbero-zod";
import type { ActionState } from "@/types/action-state";
import { requerirAdmin } from "@/lib/seguridad";

export async function createBarbero(data: unknown): Promise<ActionState> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

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

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al crear barbero" };
  }
}