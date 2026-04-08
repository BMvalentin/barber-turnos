"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type State = {
  success: boolean;
  message: string;
  user?: { name: string | null; telefono: string | null };
};

export async function updateProfile(
  userId: string,
  formData: FormData
): Promise<State> {
  const name = formData.get("name") as string;
  const telefono = formData.get("telefono") as string;

  if (!userId) {
    return { success: false, message: "ID de usuario no encontrado" };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        telefono,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Perfil actualizado",
      user: {
        name: updatedUser.name,
        telefono: updatedUser.telefono,
      },
    };
  } catch (error) {
    return { success: false, message: "Error en la base de datos" };
  }
}

export async function getUserTurnos(userId: string) {
  try {
    const turnosRaw = await prisma.turno.findMany({
      where: { userId },
      orderBy: { horarioReservado: "desc" },
      include: {
        servicio: true,
        barbero: true,
        user: true,
      },
    });

    return turnosRaw.map((t) => ({
      ...t,
      precioCongelado: Number(t.precioCongelado),
      seniaCongelada: Number(t.seniaCongelada),
      servicio: t.servicio ? {
        ...t.servicio,
        precio: Number(t.servicio.precio),
        senia: Number(t.servicio.senia),
        descuento: Number(t.servicio.descuento),
      } : t.servicio,
    }));
  } catch (error) {
    console.error("Error fetching user turnos:", error);
    return [];
  }
}

export async function cancelTurno(turnoId: string) {
  try {
    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: "CANCELADO" }, // Enum correcto
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return { success: false, message: "No se pudo cancelar el turno" };
  }
}
