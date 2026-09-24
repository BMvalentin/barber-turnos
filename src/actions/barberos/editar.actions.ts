"use server";

import { prisma } from "@/lib/prisma";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import { updateBarberoSchema } from "@/lib/barbero-zod";
import type { ActionState } from "@/types/action-state";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import type { z } from "zod";

type DatosActualizarBarbero = z.infer<typeof updateBarberoSchema>;

async function updateBarberoBase(
  data: DatosActualizarBarbero
): Promise<ActionState> {
  try {
    const contexto = await requerirPanel();
    if (!contexto) return { success: false, error: "No autorizado" };

    const parsed = updateBarberoSchema.safeParse(data);

    if (!parsed.success) {
      console.error("Zod Validation Error:", parsed.error.flatten().fieldErrors);
      return {
        success: false,
        error: "Error de validación: Revisa los campos ingresados.",
      };
    }

    const { id, nombre, srcImage, estado, serviciosIds, margenesIds } = parsed.data;

    if (contexto.rol === "EMPLEADO" && contexto.barberoId !== id) {
      return { success: false, error: "No autorizado" };
    }

    await prisma.$transaction(async (tx) => {
      const barbero = await tx.barbero.findUnique({
        where: { id },
        select: { id: true, usuario: { select: { email: true } } },
      });
      if (!barbero) throw new Error("BARBERO_NO_ENCONTRADO");

      await tx.barbero.update({
        where: { id },
        data: {
          nombre,
          // El correo se deriva siempre de la cuenta asociada; nunca del formulario.
          email: barbero.usuario?.email ?? null,
          srcImage: srcImage || null,
          ...(contexto.rol === "ADMIN" ? { estado: estado ?? true } : {}),
          updatedAt: new Date(),
        },
      });

      // El empleado puede administrar los datos de su propio perfil, servicios y horarios.
      await tx.servicioxbarbero.deleteMany({ where: { barberoId: id } });
      if (serviciosIds?.length) {
        await tx.servicioxbarbero.createMany({
          data: serviciosIds.map((sId: string) => ({
            barberoId: id,
            servicioId: sId,
          })),
        });
      }

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

    revalidarBarberos();
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar barbero:", error);
    return { success: false, error: "Error al actualizar barbero" };
  }
}

export const updateBarbero = updateBarberoBase;
