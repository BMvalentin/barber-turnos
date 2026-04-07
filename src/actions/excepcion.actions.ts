"use server";

import { prisma } from "@/lib/prisma";
import { excepcionSchema } from "@/lib/excepcion-zod";
import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export async function crearExcepcionLaboral(formData: FormData) {
  try {
    const rawData = {
      motivo: formData.get("motivo"),
      desde: formData.get("desde"),
      hasta: formData.get("hasta"),
      estado: formData.get("estado") === "true",
      barberoId: formData.get("barberoId") || null,
    };

    const validated = excepcionSchema.parse(rawData);

    // Convertir las fechas de los inputs (local) a UTC para la DB
    const fechaDesdeUtc = fromZonedTime(validated.desde, TIMEZONE);
    const fechaHastaUtc = fromZonedTime(validated.hasta, TIMEZONE);

    await prisma.excepcion_laboral.create({
      data: {
        motivo: validated.motivo,
        desde: fechaDesdeUtc,
        hasta: fechaHastaUtc,
        estado: validated.estado ?? true,
        barberoId: validated.barberoId,
      },
    });

    revalidatePath("/admin/excepciones");
    return { success: true };
  } catch (error) {
    console.error("Error al crear excepción:", error);
    return { success: false, error: "No se pudo crear la excepción laboral" };
  }
}

export async function eliminarExcepcion(id: string) {
  try {
    await prisma.excepcion_laboral.delete({ where: { id } });
    revalidatePath("/admin/excepciones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar" };
  }
}
