"use server";

import { prisma } from "@/lib/prisma";
import { servicioSchema } from "@/lib/servicios-zod";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { limpiarUrlImagen } from "@/lib/limpiar-url-imagen";
import { subirImagenServicio } from "@/lib/subir-imagen-servicio";
import { revalidarServicios } from "@/lib/revalidar/revalidar-servicios";
import type { ActionState } from "@/types/action-state";
import type { ServicioCreado } from "@/types/servicio";

const actualizarServicioBase = async (
  prevState: ActionState<ServicioCreado>,
  formData: FormData,
): Promise<ActionState<ServicioCreado>> => {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return {
        success: false,
        error: "ID no proporcionado",
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
      senia,
    } = validated.data;

    let srcImage = limpiarUrlImagen(srcImageRaw || null);

    // 👇 Si seleccionó nueva imagen, reemplaza la anterior
    if (image && image.size > 0) {
      const subida = await subirImagenServicio(image, { mensajeError: "No se pudo subir la nueva imagen." });

      if (!subida.ok) {
        return { success: false, error: subida.error };
      }

      srcImage = subida.url;
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

    revalidarServicios(servicioActualizado.id);

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
      success: false,
      error: "No se pudo actualizar el servicio. Intentalo de nuevo.",
    };
  }
};
export const actualizarServicio = exigirAdmin(actualizarServicioBase);
