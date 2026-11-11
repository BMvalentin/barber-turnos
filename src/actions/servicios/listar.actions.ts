"use server";

import { obtenerServiciosConBarberos } from "@/lib/consultas/obtener-servicios-con-barberos";
import type { ActionState } from "@/types/action-state";
import type { Servicio } from "@/types/servicio";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";

export async function getServicios(): Promise<ActionState<Servicio[]>> {
  try {
    if (!(await requerirPanel())) return { success: false, error: "No autorizado" };
    const servicios = await obtenerServiciosConBarberos();

    return {
      success: true,
      data: servicios,
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
