"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import { barberoSchema } from "@/lib/barbero-zod";
import { obtenerMargenesPorIds } from "@/lib/consultas/obtener-margenes-por-ids";
import type { ActionState } from "@/types/action-state";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function createBarberoBase(data: unknown): Promise<ActionState> {
  try {
    const parsed = barberoSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(e => e.message).join(", "),
      };
    }

    const { nombre, email, srcImage, serviciosIds, margenesIds } = parsed.data;

    const nuevoBarbero = await prisma.barbero.create({
      data: {
        nombre,
        email: email?.trim() ? email.trim() : null,
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
      const margenes = await obtenerMargenesPorIds(margenesIds);

      await prisma.margen_laboral_barbero.createMany({
        data: margenes.map((m) => ({
          barberoId: nuevoBarbero.id,
          margenLaboralId: m.id,
          diaId: m.diaId,
        })),
      });
    }

    revalidarBarberos();

    return { success: true };
  } catch {
    return { success: false, error: "Error al crear barbero" };
  }
}

export const createBarbero = exigirAdmin(createBarberoBase);
