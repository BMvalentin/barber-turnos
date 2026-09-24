"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import { barberoSchema } from "@/lib/barbero-zod";
import type { ActionState } from "@/types/action-state";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { invalidarCacheRol } from "@/lib/seguridad/requerir-admin";

async function createBarberoBase(data: unknown): Promise<ActionState> {
  try {
    const parsed = barberoSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(e => e.message).join(", "),
      };
    }

    const { nombre, usuarioId, srcImage, serviciosIds, margenesIds } = parsed.data;

    await prisma.$transaction(async (tx) => {
      const cuenta = usuarioId
        ? await tx.user.findUnique({
            where: { id: usuarioId },
            select: { id: true, email: true, role: true, barbero: { select: { id: true } } },
          })
        : null;

      if (usuarioId && !cuenta) throw new Error("CUENTA_NO_ENCONTRADA");
      if (cuenta?.barbero) throw new Error("CUENTA_YA_ASOCIADA");

      const nuevoBarbero = await tx.barbero.create({
        data: {
          nombre,
          email: cuenta?.email ?? null,
          usuarioId: cuenta?.id ?? null,
          srcImage: srcImage || null,
          estado: true,
        },
      });

      if (serviciosIds?.length) {
        await tx.servicioxbarbero.createMany({
          data: serviciosIds.map((id) => ({
            barberoId: nuevoBarbero.id,
            servicioId: id,
          })),
        });
      }

      if (margenesIds?.length) {
        const margenes = await tx.margen_laboral.findMany({
          where: { id: { in: margenesIds } },
        });

        await tx.margen_laboral_barbero.createMany({
          data: margenes.map((m) => ({
            barberoId: nuevoBarbero.id,
            margenLaboralId: m.id,
            diaId: m.diaId,
          })),
        });
      }

      // Una cuenta común asociada a un barbero pasa a ser empleado para poder
      // acceder al panel y administrar su propio perfil.
      if (cuenta?.role === "USER") {
        await tx.user.update({ where: { id: cuenta.id }, data: { role: "EMPLEADO" } });
      }
    });

    if (usuarioId) invalidarCacheRol(usuarioId);

    revalidarBarberos();
    revalidatePath("/admin/usuarios");

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "CUENTA_NO_ENCONTRADA") {
      return { success: false, error: "La cuenta seleccionada no existe" };
    }
    if (error instanceof Error && error.message === "CUENTA_YA_ASOCIADA") {
      return { success: false, error: "La cuenta seleccionada ya está asociada a un barbero" };
    }
    return { success: false, error: "Error al crear barbero" };
  }
}

export const createBarbero = exigirAdmin(createBarberoBase);
