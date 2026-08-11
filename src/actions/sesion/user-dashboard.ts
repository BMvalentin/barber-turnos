"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enviarEmailTurno } from "@/lib/email";
import { requerirSesion, requerirAdmin } from "@/lib/seguridad";

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
  let telefono = formData.get("telefono") as string;

  if (!userId) {
    return { success: false, message: "ID de usuario no encontrado" };
  }

  // Solo el propio usuario (o un admin) puede editar su perfil
  const sesion = await requerirSesion();
  if (!sesion) {
    return { success: false, message: "No autorizado" };
  }
  const esAdmin = sesion.user.role === "ADMIN";
  if (!esAdmin && userId !== sesion.user.id) {
    return { success: false, message: "No autorizado" };
  }

  if (!telefono || telefono.trim() === "") {
    return { success: false, message: "El teléfono es obligatorio" };
  }

  telefono = telefono.trim();

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
    // Solo el propio usuario (o un admin) puede ver sus turnos
    const sesion = await requerirSesion();
    if (!sesion) return [];
    const esAdmin = sesion.user.role === "ADMIN";
    if (!esAdmin && userId !== sesion.user.id) return [];

    const turnosRaw = await prisma.turno.findMany({
      where: { userId },
      orderBy: { horarioReservado: "desc" },
      include: {
        servicio: true,
        barbero: true,
        user: { select: { id: true, name: true, email: true, telefono: true } },
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
    // Solo el dueño del turno (o un admin) puede cancelarlo
    const sesion = await requerirSesion();
    if (!sesion) return { success: false, message: "No autorizado" };

    const turnoExistente = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: { userId: true },
    });
    if (!turnoExistente) {
      return { success: false, message: "No se pudo cancelar el turno" };
    }

    const esAdmin = sesion.user.role === "ADMIN" || (await requerirAdmin());
    if (!esAdmin && turnoExistente.userId !== sesion.user.id) {
      return { success: false, message: "No autorizado" };
    }

    const turnoActualizado = await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: "CANCELADO" },
      include: {
        user: { select: { id: true, name: true, email: true, telefono: true } },
        barbero: true,
        servicio: true,
      },
    });

    void enviarEmailTurno(turnoActualizado, "CANCELADO").catch((error) => console.error("Error enviando email de cancelación desde dashboard:", error));

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return { success: false, message: "No se pudo cancelar el turno" };
  }
}
