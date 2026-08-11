"use server";

import { prisma } from "@/lib/prisma";
import { servicioSchema } from "@/lib/servicios-zod";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { limpiarUrlImagen } from "@/lib/limpiar-url-imagen";
import { subirImagenServicio } from "@/lib/subir-imagen-servicio";
import { revalidarServicios } from "@/lib/revalidar/revalidar-servicios";
import type { ActionState } from "@/types/action-state";
import type { ServicioCreado } from "@/types/servicio";

const createServicioBase = async (
  prevState: ActionState<ServicioCreado>,
  formData: FormData,
): Promise<ActionState<ServicioCreado>> => {
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

    let srcImage = limpiarUrlImagen(srcImageRaw || null);

    if (image && image.size > 0) {
      const subida = await subirImagenServicio(image, { mensajeError: "No se pudo subir la imagen." });

      if (!subida.ok) {
        return { success: false, error: subida.error };
      }

      srcImage = subida.url;
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

    revalidarServicios();

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
      success: false,
      error: "No se pudo crear el servicio. Intentalo de nuevo.",
    };
  }
};

export const createServicio = exigirAdmin(createServicioBase);
