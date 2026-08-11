"use server";

import { obtenerServiciosConBarberos } from "@/lib/consultas/obtener-servicios-con-barberos";
import type { ActionState } from "@/types/action-state";
import type { ServicioConBarberos } from "@/types/servicio";

export async function getServicios(): Promise<ActionState<ServicioConBarberos[]>> {
  try {
    const servicios = await obtenerServiciosConBarberos();

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
  } catch (error) {
    console.error("Error al obtener servicios:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: "Error inesperado al obtener los servicios",
      data: [],
    };
  }
}
