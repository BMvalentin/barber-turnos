"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
  data?: any;
};

// Función helper para limpiar y validar URLs de imágenes
function cleanImageUrl(url: string | null): string | null {
  if (!url || url.trim() === "") return null;

  let cleaned = url.trim();

  if (cleaned.includes("public\\") || cleaned.includes("public/")) {
    cleaned = cleaned.replace(/^.*public[\\\/]/, "/");
  }

  if (cleaned.match(/^[A-Za-z]:\\/)) {
    console.warn("⚠️ Ruta de Windows detectada, no se guardará:", cleaned);
    return null;
  }

  if (!cleaned.startsWith("http") && !cleaned.startsWith("/")) {
    cleaned = "/" + cleaned;
  }

  cleaned = cleaned.replace(/\\/g, "/");

  return cleaned;
}

export const getServicios = async (): Promise<ActionState> => {
  try {
    const servicios = await prisma.servicio.findMany({
      where: {
        estado: true,
      },
      include: {
        servicios: {
          include: {
            barbero: {
              select: {
                id: true,
                nombre: true,
                srcImage: true,
                estado: true,
                horarios: {
                  where: {
                    estado: true,
                  },
                  include: {
                    dia: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 💡 SOLUCIÓN: Convertimos todos los Decimal a Number nativo
    const serviciosPlanos = servicios.map((servicio) => ({
      ...servicio,
      precio: Number(servicio.precio),
      descuento: Number(servicio.descuento),
      senia: Number(servicio.senia),
    }));

    return {
      success: true,
      data: serviciosPlanos,
    };
  } catch (error: any) {
    console.error("Error al obtener servicios:", error);
    return {
      success: false,
      error: error?.message ?? "Error inesperado al obtener los servicios",
      data: [],
    };
  }
};

export const createServicio = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const nombre = formData.get("nombre") as string;
    const srcImageRaw = formData.get("srcImage") as string;
    const estadoValue = formData.get("estado");
    const descripcion = formData.get("descripcion") as string;
    const duracion = parseInt(formData.get("duracion") as string);
    const precio = parseFloat(formData.get("precio") as string);
    const descuento = parseFloat(formData.get("descuento") as string) || 0;
    const senia = parseFloat(formData.get("senia") as string) || 0;

    if (!nombre || nombre.trim() === "") {
      return { error: "El nombre del servicio es requerido", success: false };
    }
    if (!duracion || duracion <= 0) {
      return {
        error: "La duración es requerida y debe ser mayor a 0",
        success: false,
      };
    }
    if (!precio || precio <= 0) {
      return {
        error: "El precio es requerido y debe ser mayor a 0",
        success: false,
      };
    }

    const srcImage = cleanImageUrl(srcImageRaw);
    const estado = estadoValue === "true";

    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || null,
        srcImage: srcImage,
        estado: estado,
        duracion: duracion,
        precio: precio,
        descuento: descuento,
        senia: senia,
      },
    });

    revalidatePath("/servicio");

    // 💡 SOLUCIÓN: Convertimos a Number antes de retornar
    return {
      success: true,
      data: {
        ...nuevoServicio,
        precio: Number(nuevoServicio.precio),
        descuento: Number(nuevoServicio.descuento),
        senia: Number(nuevoServicio.senia),
      },
    };
  } catch (error) {
    console.error("Error al crear servicio:", error);
    return {
      error: `Error al crear: ${error instanceof Error ? error.message : "Error desconocido"}`,
      success: false,
    };
  }
};

export const actualizarServicio = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const id = formData.get("id") as string;
    const nombre = formData.get("nombre") as string;
    const srcImageRaw = formData.get("srcImage") as string;
    const descripcion = formData.get("descripcion") as string;
    const estadoValue = formData.get("estado");
    const duracion = parseInt(formData.get("duracion") as string);
    const precio = parseFloat(formData.get("precio") as string);
    const descuento = parseFloat(formData.get("descuento") as string) || 0;
    const senia = parseFloat(formData.get("senia") as string) || 0;

    if (!id || id.trim() === "") {
      return { error: "ID del servicio es requerido", success: false };
    }
    if (!nombre || nombre.trim() === "") {
      return { error: "El nombre del servicio es requerido", success: false };
    }
    if (!duracion || duracion <= 0) {
      return {
        error: "La duración es requerida y debe ser mayor a 0",
        success: false,
      };
    }
    if (!precio || precio <= 0) {
      return {
        error: "El precio es requerido y debe ser mayor a 0",
        success: false,
      };
    }

    const srcImage = cleanImageUrl(srcImageRaw);
    const estado = estadoValue === "true";

    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || null,
        srcImage: srcImage,
        estado: estado,
        duracion: duracion,
        precio: precio,
        descuento: descuento,
        senia: senia,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/servicio");

    // 💡 SOLUCIÓN: Convertimos a Number antes de retornar
    return {
      success: true,
      data: {
        ...servicioActualizado,
        precio: Number(servicioActualizado.precio),
        descuento: Number(servicioActualizado.descuento),
        senia: Number(servicioActualizado.senia),
      },
    };
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    return {
      error: `Error al actualizar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      success: false,
    };
  }
};

export const deleteservicio = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const id = formData.get("id") as string;

    if (!id || id.trim() === "") {
      return {
        error: "ID del servicio es requerido",
        success: false,
      };
    }

    const servicioConTurnos = await prisma.servicio.findUnique({
      where: { id },
      include: {
        turnos: true,
      },
    });

    if (!servicioConTurnos) {
      return { error: "Servicio no encontrado", success: false };
    }

    if (servicioConTurnos.turnos.length > 0) {
      return {
        error: "No se puede eliminar: tiene turnos asociados",
        success: false,
      };
    }

    await prisma.servicio.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/servicio");

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return {
      error: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      success: false,
    };
  }
};

export const getServicioById = async (id: string): Promise<ActionState> => {
  try {
    const servicio = await prisma.servicio.findUnique({
      where: { id },
      include: {
        servicios: {
          include: {
            barbero: {
              select: { id: true, nombre: true, srcImage: true, estado: true },
            },
          },
        },
      },
    });

    if (!servicio) {
      return { error: "Servicio no encontrado", success: false };
    }

    // 💡 SOLUCIÓN: Convertimos a Number y enviamos el objeto de manera plana
    return {
      success: true,
      data: {
        ...servicio,
        precio: Number(servicio.precio),
        descuento: Number(servicio.descuento),
        senia: Number(servicio.senia),
      },
    };
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    return {
      error: "Error al obtener el servicio",
      success: false,
    };
  }
};
