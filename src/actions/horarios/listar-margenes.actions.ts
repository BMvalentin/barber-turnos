"use server";

import { obtenerMargenesDeDia } from "@/lib/consultas/obtener-margenes-de-dia";

export async function getMargenesLaborales(diaId: string) {
  try {
    const margenes = await obtenerMargenesDeDia(diaId);

    return margenes;
  } catch (error) {
    console.error("Error al obtener márgenes laborales:", error);
    throw new Error("Error al obtener los márgenes laborales");
  }
}
