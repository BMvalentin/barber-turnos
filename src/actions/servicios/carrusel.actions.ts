"use server";

import { getCachedData } from "@/lib/cache";
import { obtenerServiciosRecientes } from "@/lib/consultas/obtener-servicios-recientes";
import { listarUrlImagenesServicio } from "@/lib/servicio-imagenes/listar-url";
import type { ActionState } from "@/types/action-state";
import type { ServicioCarrusel } from "@/types/servicio";

export async function getServiciosCarrusel(): Promise<ActionState<ServicioCarrusel[]>> {
  try {
    const servicios = (
      await getCachedData(
        ["servicios-carrusel-v2"],
        ["servicios"],
        async () => {
          const datos = await obtenerServiciosRecientes();

          return datos.map((s) => ({
            ...s,
            precio: Number(s.precio),
            descuento: Number(s.descuento),
          }));
        },
        60,
      )
    ).map((s) => ({
      ...s,
      precio: Number(s.precio),
      descuento: Number(s.descuento),
      // Garantiza que `imagenes` sea SIEMPRE un array: sanea tanto datos
      // frescos como la entrada cacheada de versiones anteriores (sin `imagenes`),
      // cayendo a `srcImage` para servicios legados.
      imagenes: listarUrlImagenesServicio(s),
    }));

    return {
      success: true,
      data: servicios,
    };
  } catch (error) {
    console.error("Error al obtener servicios para carrusel:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: "Error al cargar los servicios del carrusel",
      data: [],
    };
  }
}
