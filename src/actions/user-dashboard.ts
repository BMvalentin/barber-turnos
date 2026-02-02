"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


// Definimos el estado de retorno para saber si falló
export type State = {
  success: boolean;
  message: string;
  user?: { name: string | null; telefono: string | null };
};

export async function updateProfile(userId: string, formData: FormData): Promise<State> {
  console.log("🟢 1. Server Action Iniciado. Usuario ID:", userId);

  const name = formData.get("name") as string;
  const telefono = formData.get("telefono") as string;

  console.log("🟢 2. Datos recibidos:", { name, telefono });

  if (!userId) {
    console.log("🔴 Error: No llegó el User ID");
    return { success: false, message: "ID de usuario no encontrado" };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name,
        telefono: telefono 
      },
    });

    console.log("🟢 3. Actualización en DB exitosa");
    revalidatePath("/dashboard"); // Actualiza la UI
    return { 
      success: true, 
      message: "Perfil actualizado", 
      user: { name: updatedUser.name, telefono: updatedUser.telefono } 
    };

  } catch (error) {
    console.error("🔴 Error al actualizar:", error);
    return { success: false, message: "Error en la base de datos" };
  }
}

export async function getUserTurnos(userId: string) {
  try {
    const turnosRaw = await prisma.turno.findMany({
      where: { userId },
      orderBy: { horarioReservado: 'desc' }, // Los más recientes primero
      include: {
        vehiculo_servicio: {
          include: { servicio: true, vehiculo: true },
        },
      },
    });

    // Serialización necesaria para pasar objetos de Prisma a Client Components
    return turnosRaw.map((t) => ({
      ...t,
      precioCongelado: t.precioCongelado.toNumber(),
      seniaCongelada: t.seniaCongelada.toNumber(),
      vehiculo_servicio: {
        ...t.vehiculo_servicio,
        precio: t.vehiculo_servicio.precio.toNumber(),
        descuento: t.vehiculo_servicio.descuento.toNumber(),
        senia: t.vehiculo_servicio.senia.toNumber(),
      },
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
      data: { estado: 0 }, // 0 = cancelado 1= pendiente 2= completado
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: "No se pudo cancelar el turno" };
  }
}