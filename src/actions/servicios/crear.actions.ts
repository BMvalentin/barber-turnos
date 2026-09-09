"use server";

import { prisma } from "@/lib/prisma";
import { servicioSchema } from "@/lib/servicios-zod";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { subirImagenServicio } from "@/lib/subir-imagen-servicio";
import { leerSlotsImagenesServicio } from "@/lib/servicio-imagenes/leer-slots";
import { MAX_IMAGENES_SERVICIO } from "@/lib/servicio-imagenes/constantes";
import { revalidarServicios } from "@/lib/revalidar/revalidar-servicios";
import type { ActionState } from "@/types/action-state";
import type { ServicioCreado } from "@/types/servicio";

const createServicioBase = async (
  prevState: ActionState<ServicioCreado>,
  formData: FormData,
): Promise<ActionState<ServicioCreado>> => {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const clavesSlots = Object.keys(rawData).filter((clave) => clave.startsWith("slot"));
    clavesSlots.forEach((clave) => delete rawData[clave]);

    const validated = servicioSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        error: "Error de validación en los datos del servicio.",
      };
    }

    const { nombre, descripcion, estado, duracion, precio, descuento, senia } = validated.data;

    const entradasImagenes = leerSlotsImagenesServicio(formData);

    if (entradasImagenes.length > MAX_IMAGENES_SERVICIO) {
      return {
        success: false,
        error: "Un servicio no puede tener más de 3 imágenes.",
      };
    }

    const imagenes: string[] = [];

    for (const entrada of entradasImagenes) {
      if (typeof entrada === "string") {
        imagenes.push(entrada);
        continue;
      }

      const subida = await subirImagenServicio(entrada, {
        mensajeError: "No se pudo subir una de las imágenes.",
      });

      if (!subida.ok) {
        return { success: false, error: subida.error };
      }

      imagenes.push(subida.url);
    }

    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || null,
        srcImage: imagenes[0] ?? null,
        estado: estado ?? true,
        duracion: duracion,
        precio: precio,
        descuento: descuento,
        senia: senia,
        imagenes: {
          create: imagenes.map((url, indice) => ({ url, orden: indice })),
        },
      },
      include: {
        imagenes: { orderBy: { orden: "asc" }, select: { url: true } },
      },
    });

    revalidarServicios(nuevoServicio.id);

    return {
      success: true,
      data: {
        ...nuevoServicio,
        precio: Number(nuevoServicio.precio),
        descuento: Number(nuevoServicio.descuento),
        senia: Number(nuevoServicio.senia),
        imagenes: nuevoServicio.imagenes.map((imagen) => imagen.url),
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
