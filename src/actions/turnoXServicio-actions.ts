"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
  data?: any;
};

export async function createTurnoXServicio(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const servicioId = formData.get("id_servicio");
    const duracion = formData.get("duracionMinutos");
    const precio = formData.get("precio");
    const descuento = formData.get("descuento");
    const senia = formData.get("senia");

    if (!servicioId || !duracion || !precio) {
      return { success: false, error: "Faltan datos obligatorios" };
    }

    const turnoServicio = await prisma.turno_servicio.create({
      data: {
        servicioId: String(servicioId),
        duracion: Number(duracion),
        precio: String(precio),
        descuento: String(descuento || 0),
        senia: String(senia || 0),
        estado: true
      }
    });

    revalidatePath("/turnoXServicio");

    return { success: true, data: turnoServicio };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}
export async function updateTurnoXServicio(
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> {
    try {
      const id = formData.get("id");
  
      if (!id) {
        return { success: false, error: "ID no proporcionado" };
      }
  
      const turnoServicio = await prisma.turno_servicio.update({
        where: { id: String(id) },
        data: {
          servicioId: String(formData.get("id_servicio")),
          duracion: Number(formData.get("duracionMinutos")),
          precio: String(formData.get("precio")),
          descuento: String(formData.get("descuento") || 0),
          senia: String(formData.get("senia") || 0)
        }
      });
  
      revalidatePath("/turnoXServicio");
  
      return { success: true, data: turnoServicio };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }
  export async function deleteTurnoXServicio(
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> {
    try {
      const id = formData.get("id");
  
      if (!id) {
        return { success: false, error: "ID no proporcionado" };
      }
  
      const existe = await prisma.turno_servicio.findUnique({
        where: { id: String(id) },
        include: {
          turnos: true
        }
      });
  
      if (!existe) {
        return { success: false, error: "Turno x Servicio no encontrado" };
      }
  
      if (existe.turnos.length > 0) {
        return {
          success: false,
          error: "No se puede eliminar: tiene turnos asociados"
        };
      }
  
      await prisma.turno_servicio.update({
        where: { id: String(id) },
        data: { estado: false }
      });
  
      revalidatePath("/turnoXServicio");
  
      return { success: true, data: { id } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }
  export async function getTurnos() {
    return prisma.turno.findMany({
      include: {
        user: true,
        barbero: true,
        turnoServicio: {
          include: {
            servicio: true
          }
        }
      },
      orderBy: {
        horarioReservado: "asc"
      }
    });
  }
  export async function getTurnosByBarbero(barberoId: string) {
    return prisma.turno.findMany({
      where: { barberoId },
      include: {
        user: true,
        turnoServicio: {
          include: {
            servicio: true
          }
        }
      }
    });
  }
      