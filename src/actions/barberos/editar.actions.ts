"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateBarberoSchema } from "@/lib/barbero-zod";
import type { ActionState } from "@/types/action-state";
import { requerirAdmin } from "@/lib/seguridad";
import type { z } from "zod";

type DatosActualizarBarbero = z.infer<typeof updateBarberoSchema>;

export async function updateBarbero(
  data: DatosActualizarBarbero
): Promise<ActionState> {
  try {
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const parsed = updateBarberoSchema.safeParse(data);

    if (!parsed.success) {
      console.error("Zod Validation Error:", parsed.error.flatten().fieldErrors);
      return {
        success: false,
        error: "Error de validación: Revisa los campos ingresados.",
      };
    }

    const { id, nombre, srcImage, estado, serviciosIds, margenesIds } = parsed.data;

    await prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos
      await tx.barbero.update({
        where: { id },
        data: {
          nombre,
          srcImage: srcImage || null,
          estado: estado ?? true,
          updatedAt: new Date(),
        },
      });

      // 2. Sincronizar Servicios
      await tx.servicioxbarbero.deleteMany({ where: { barberoId: id } });
      if (serviciosIds?.length) {
        await tx.servicioxbarbero.createMany({
          data: serviciosIds.map((sId: string) => ({
            barberoId: id,
            servicioId: sId,
          })),
        });
      }

      // 3. Sincronizar Horarios
      await tx.margen_laboral_barbero.deleteMany({ where: { barberoId: id } });
      if (margenesIds?.length) {
        const margenes = await tx.margen_laboral.findMany({
          where: { id: { in: margenesIds } },
        });

        await tx.margen_laboral_barbero.createMany({
          data: margenes.map((m) => ({
            barberoId: id,
            margenLaboralId: m.id,
            diaId: m.diaId,
          })),
        });
      }
    });

    revalidatePath("/barbero");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar barbero:", error);
    return { success: false, error: "Error al actualizar barbero" };
  }
}