"use server";

import { obtenerBarberosConRelaciones } from "@/lib/consultas/obtener-barberos-con-relaciones";
import type { ActionState } from "@/types/action-state";
import type { BarberoConRelaciones } from "@/types/barbero";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";

export async function getBarberos(): Promise<ActionState<BarberoConRelaciones[]>> {
  try {
    const sesionAdmin = await requerirAdmin();
    if (!sesionAdmin) return { success: false, error: "No autorizado" };
    const barberos = await obtenerBarberosConRelaciones();

    const data = barberos.map((b) => ({
      ...b,
      servicios: b.servicios.map((s) => ({
        ...s,
        servicio: {
          ...s.servicio,
          precio: s.servicio.precio ? Number(s.servicio.precio) : null,
          senia: s.servicio.senia ? Number(s.servicio.senia) : null,
          descuento: s.servicio.descuento ? Number(s.servicio.descuento) : null,
        },
      })),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener barberos:", error);
    return { success: false, error: "Error al obtener barberos" };
  }
}
