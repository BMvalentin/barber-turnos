"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { servicioSchema } from "@/lib/servicios-zod";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary-uploader";

export type ActionState = {
  error?: string;
  errors?: Record<string, string[]>;
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

export const getServiciosCarrusel = async (): Promise<ActionState> => {
  try {
    const servicios = await prisma.servicio.findMany({
      where: {
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        srcImage: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: servicios,
    };
  } catch (error: any) {
    console.error("Error al obtener servicios para carrusel:", error);
    return {
      success: false,
      error: "Error al cargar los servicios del carrusel",
      data: [],
    };
  }
};

export const createServicio = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const image = formData.get("image") as File | null;
    const rawData = Object.fromEntries(formData.entries());

    delete rawData.image;

    // Validar con Zod
    const validated = servicioSchema.safeParse(rawData);


    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        error: "Error de validación en los datos del servicio.",
      };
    }

    const { nombre, descripcion, srcImage: srcImageRaw, estado, duracion, precio, descuento, senia } = validated.data;

    let srcImage = cleanImageUrl(srcImageRaw || null);

    if (image && image.size > 0) {
      const upload = await uploadMultipleToCloudinary([image], {
        folder: "barberia/servicios",
      });

      const uploaded = upload.find((r) => r.success);

      if (!uploaded?.url) {
        return {
          success: false,
          error: "No se pudo subir la imagen.",
        };
      }

      srcImage = uploaded.url;
    }

    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || null,
        srcImage: srcImage,
        estado: estado ?? true,
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

    if (!id) {
      return { 
        success: false, 
        error: "ID no proporcionado" 
      };
    }

    // 👇 Obtener imagen nueva si existe
    const image = formData.get("image") as File | null;

    const rawData = Object.fromEntries(formData.entries());

    // No mandar File al zod
    delete rawData.image;

    const validated = servicioSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        error: "Error de validación al actualizar.",
      };
    }

    const {
      nombre,
      descripcion,
      srcImage: srcImageRaw,
      estado,
      duracion,
      precio,
      descuento,
      senia
    } = validated.data;


    let srcImage = cleanImageUrl(srcImageRaw || null);


    // 👇 Si seleccionó nueva imagen, reemplaza la anterior
    if (image && image.size > 0) {
      const upload = await uploadMultipleToCloudinary([image], {
        folder: "barberia/servicios",
      });

      const uploaded = upload.find((r) => r.success);

      if (!uploaded?.url) {
        return {
          success: false,
          error: "No se pudo subir la nueva imagen.",
        };
      }

      srcImage = uploaded.url;
    }


    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || null,
        srcImage,
        estado: estado ?? true,
        duracion,
        precio,
        descuento,
        senia,
        updatedAt: new Date(),
      },
    });


    revalidatePath("/servicio");


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
      error: `Error al actualizar: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
      success: false,
    };
  }
};

export const deleteservicio = async (
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
