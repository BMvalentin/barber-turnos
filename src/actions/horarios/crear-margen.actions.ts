"use server";

import { revalidarDiasLaborales } from "@/lib/revalidar/revalidar-dias-laborales";
import { prisma } from "@/lib/prisma";
import { obtenerMargenesDeDia } from "@/lib/consultas/obtener-margenes-de-dia";
import { compararHoras } from "@/lib/horarios/comparar-horas";
import { horariosSeSuperponen } from "@/lib/horarios/horarios-se-superponen";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

import type { ActionState } from "@/types/action-state";
import type { MargenLaboralCreado } from "@/types/horarios";

async function createMargenLaboralBase(
  prevState: ActionState<MargenLaboralCreado>,
  formData: FormData
): Promise<ActionState<MargenLaboralCreado>> {
  try {
    const diaId = formData.get("diaId") as string;
    const estado = formData.get("estado") === "true";
    const desde = formData.get("desde") as string;
    const hasta = formData.get("hasta") as string;

    // Validar que 'hasta' sea mayor que 'desde'
    if (compararHoras(hasta, desde) <= 0) {
      return {
        success: false,
        error: "La hora 'Cierre' debe ser mayor que la hora 'Apertura'",
      };
    }

    // Verificar que el día laboral existe
    await prisma.dia_laboral.findUnique({
      where: { id: diaId },
    });

    // Obtener todos los márgenes del día para detectar solapamientos (solo advertencia)
    const margenesExistentes = await obtenerMargenesDeDia(diaId);

    // Detectar si ya existe un rango idéntico
    const esDuplicadoExacto = margenesExistentes.some(
      (m) => m.desde === desde && m.hasta === hasta
    );

    // Detectar solapamientos (no bloqueante, solo informativo)
    const margenesConSolapamiento = margenesExistentes.filter((m) =>
      horariosSeSuperponen(desde, hasta, m.desde, m.hasta)
    );

    let warning: string | undefined;
    if (esDuplicadoExacto) {
      warning = `Ya existe un rango idéntico (${desde} - ${hasta}). Se creó igualmente para poder asignarlo a otro barbero.`;
    } else if (margenesConSolapamiento.length > 0) {
      const rangosSolapados = margenesConSolapamiento
        .map((m) => `${m.desde} - ${m.hasta}`)
        .join(", ");
      warning = `Este horario se solapa con: ${rangosSolapados}. Se creó igualmente para poder asignarlo a distintos barberos.`;
    }

    // Crear el margen laboral
    const margen = await prisma.margen_laboral.create({
      data: {
        diaId,
        estado,
        desde,
        hasta,
      },
    });

    revalidarDiasLaborales();

    return {
      success: true,
      data: margen,
      warning,
    };
  } catch (error) {
    console.error("Error al crear margen laboral:", error);
    return {
      success: false,
      error: "Error al crear el margen laboral",
    };
  }
}

export const createMargenLaboral = exigirAdmin(createMargenLaboralBase);
