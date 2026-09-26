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

const actualizarServicioBase = async (
  prevState: ActionState<ServicioCreado>,
  formData: FormData,
): Promise<ActionState<ServicioCreado>> => {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID no proporcionado" };
    }

    const rawData = Object.fromEntries(formData.entries());
    const clavesSlots = Object.keys(rawData).filter((clave) => clave.startsWith("slot"));
    clavesSlots.forEach((clave) => delete rawData[clave]);

    const validated = servicioSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        error: "Error de validación al actualizar.",
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

    const urlsFinales: string[] = [];

    for (const entrada of entradasImagenes) {
      if (typeof entrada === "string") {
        urlsFinales.push(entrada);
        continue;
      }

      const subida = await subirImagenServicio(entrada, {
        mensajeError: "No se pudo subir una de las imágenes.",
      });

      if (!subida.ok) {
        return { success: false, error: subida.error };
      }

      urlsFinales.push(subida.url);
    }

    await prisma.$transaction([
      prisma.servicio_imagen.deleteMany({ where: { servicioId: id } }),
      prisma.servicio_imagen.createMany({
        data: urlsFinales.map((url, indice) => ({ url, orden: indice, servicioId: id })),
      }),
      prisma.servicio.update({
        where: { id },
        data: {
          nombre: nombre.trim(),
          descripcion: descripcion || null,
          srcImage: urlsFinales[0] ?? null,
          estado: estado ?? true,
          duracion,
          precio,
          descuento,
          senia,
          updatedAt: new Date(),
        },
      }),
    ]);

    const servicioActualizado = await prisma.servicio.findUnique({
      where: { id },
      include: {
        imagenes: { orderBy: { orden: "asc" }, select: { url: true } },
      },
    });

    revalidarServicios(id);

    return {
      success: true,
      data:
        servicioActualizado
          ? {
              ...servicioActualizado,
              precio: Number(servicioActualizado.precio),
              descuento: Number(servicioActualizado.descuento),
              senia: Number(servicioActualizado.senia),
              imagenes: servicioActualizado.imagenes.map((imagen) => imagen.url),
            }
          : {
              id,
              nombre: nombre.trim(),
              descripcion: descripcion || null,
              srcImage: urlsFinales[0] ?? null,
              estado: estado ?? true,
              duracion,
              precio,
              descuento,
              senia,
              createdAt: new Date(),
              updatedAt: new Date(),
              imagenes: urlsFinales,
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
