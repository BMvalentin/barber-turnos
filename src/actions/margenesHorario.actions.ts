"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  success: boolean;
  data?: any;
  error?: string;
  warning?: string;
};

/**
 * Valida formato de hora HH:mm
 */
function validarFormatoHora(hora: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
}

/**
 * Compara dos horas en formato HH:mm
 * Retorna: -1 si hora1 < hora2, 0 si son iguales, 1 si hora1 > hora2
 */
function compararHoras(hora1: string, hora2: string): number {
  const [h1, m1] = hora1.split(":").map(Number);
  const [h2, m2] = hora2.split(":").map(Number);
  
  const minutos1 = h1 * 60 + m1;
  const minutos2 = h2 * 60 + m2;
  
  if (minutos1 < minutos2) return -1;
  if (minutos1 > minutos2) return 1;
  return 0;
}

/**
 * Verifica si dos rangos de horarios se solapan
 */
function horariosSeSuperponen(
  desde1: string,
  hasta1: string,
  desde2: string,
  hasta2: string
): boolean {
  // Rango 1: [desde1, hasta1]
  // Rango 2: [desde2, hasta2]
  
  // No se superponen si:
  // - hasta1 <= desde2 (rango 1 termina antes que empiece rango 2)
  // - hasta2 <= desde1 (rango 2 termina antes que empiece rango 1)
  
  const hasta1LeDesde2 = compararHoras(hasta1, desde2) <= 0;
  const hasta2LeDesde1 = compararHoras(hasta2, desde1) <= 0;
  
  return !(hasta1LeDesde2 || hasta2LeDesde1);
}

// Crear margen laboral
export async function createMargenLaboral(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
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
    const margenesExistentes = await prisma.margen_laboral.findMany({
      where: { diaId },
    });

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

    revalidatePath("/diaLaboral");

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

// Actualizar margen laboral
export async function updateMargenLaboral(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
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

    // Verificar que existe
    const existing = await prisma.margen_laboral.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Margen laboral no encontrado",
      };
    }

    // Obtener todos los márgenes del día (excluyendo el actual)
    const margenesExistentes = await prisma.margen_laboral.findMany({
      where: {
        diaId,
        id: { not: id },
      },
    });

    // Detectar si ya existe un rango idéntico (excluyendo el actual)
    const esDuplicadoExacto = margenesExistentes.some(
      (m) => m.desde === desde && m.hasta === hasta
    );

    // Detectar solapamientos (no bloqueante, solo informativo)
    const margenesConSolapamiento = margenesExistentes.filter((m) =>
      horariosSeSuperponen(desde, hasta, m.desde, m.hasta)
    );

    let warning: string | undefined;
    if (esDuplicadoExacto) {
      warning = `Ya existe un rango idéntico (${desde} - ${hasta}). Se guardó igualmente para poder asignarlo a otro barbero.`;
    } else if (margenesConSolapamiento.length > 0) {
      const rangosSolapados = margenesConSolapamiento
        .map((m) => `${m.desde} - ${m.hasta}`)
        .join(", ");
      warning = `Este horario se solapa con: ${rangosSolapados}. Se guardó igualmente para poder asignarlo a distintos barberos.`;
    }

    // Actualizar el margen laboral
    const margen = await prisma.margen_laboral.update({
      where: { id },
      data: {
        estado,
        desde,
        hasta,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: margen,
      warning,
    };
  } catch (error) {
    console.error("Error al actualizar margen laboral:", error);
    return {
      success: false,
      error: "Error al actualizar el margen laboral",
    };
  }
}

// Eliminar margen laboral
export async function deleteMargenLaboral(id: string): Promise<ActionState> {
  try {

    await prisma.margen_laboral.delete({
      where: { id },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: { message: "Margen laboral eliminado correctamente" },
    };
  } catch (error) {
    console.error("Error al eliminar margen laboral:", error);
    return {
      success: false,
      error: "Error al eliminar el margen laboral",
    };
  }
}

// Obtener márgenes de un día laboral
export async function getMargenesLaborales(diaId: string) {
  try {
    const margenes = await prisma.margen_laboral.findMany({
      where: { diaId },
      orderBy: { desde: "asc" },
    });

    return margenes;
  } catch (error) {
    console.error("Error al obtener márgenes laborales:", error);
    throw new Error("Error al obtener los márgenes laborales");
  }
}

const DIAS_NOMBRES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export async function getHorariosCompactos() {
  try {
    const diasLaborales = await prisma.dia_laboral.findMany({
      where: { estado: true },
      include: {
        margenes: {
          where: { estado: true },
          orderBy: { desde: "asc" },
        },
      },
      orderBy: { dia: "asc" }, // 0 = Domingo, 1 = Lunes, etc.
    });

    if (diasLaborales.length === 0) return ["Cerrado"];

    const ORDEN_DIAS: Record<string, number> = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miercoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sabado: 6,
    };

    // Ordenar los días cronológicamente
    diasLaborales.sort((a: any, b: any) => ORDEN_DIAS[a.dia] - ORDEN_DIAS[b.dia]);

    // 1. Mapeamos a un formato procesable
    const diasProcesados = diasLaborales.map((d: any) => {
      // Ordenar márgenes por hora de inicio
      const margenes: { desde: string; hasta: string }[] = [...d.margenes].sort(
        (a: any, b: any) => a.desde.localeCompare(b.desde)
      );

      if (margenes.length === 0) {
        return { num: ORDEN_DIAS[d.dia], nombre: DIAS_NOMBRES[ORDEN_DIAS[d.dia]], horario: "Cerrado" };
      }

      // Fusionar rangos solapados: si A y B se superponen, tomar el mayor span
      const fusionados: { desde: string; hasta: string }[] = [];
      for (const m of margenes) {
        const ultimo = fusionados[fusionados.length - 1];
        if (ultimo && m.desde <= ultimo.hasta) {
          // Se solapa: extender el hasta si el nuevo es mayor
          if (m.hasta > ultimo.hasta) ultimo.hasta = m.hasta;
        } else {
          fusionados.push({ desde: m.desde, hasta: m.hasta });
        }
      }

      const horarioStr = fusionados.map((f) => `${f.desde} a ${f.hasta}`).join(", ");
      const numDia = ORDEN_DIAS[d.dia];

      return {
        num: numDia,
        nombre: DIAS_NOMBRES[numDia],
        horario: horarioStr || "Cerrado",
      };
    });

    // 2. Agrupación por continuidad y similitud de horarios
    const grupos: { start: number; end: number; horario: string }[] = [];

    for (const dia of diasProcesados) {
      const ultimoGrupo = grupos[grupos.length - 1];

      // Si el horario es igual al del grupo anterior Y es el día consecutivo
      if (ultimoGrupo && ultimoGrupo.horario === dia.horario && ultimoGrupo.end === dia.num - 1) {
        ultimoGrupo.end = dia.num;
      } else {
        grupos.push({
          start: dia.num,
          end: dia.num,
          horario: dia.horario,
        });
      }
    }

    // 3. Formatear el string final
    return grupos.map((g) => {
      const nombreRango =
        g.start === g.end
          ? DIAS_NOMBRES[g.start]
          : `${DIAS_NOMBRES[g.start]} a ${DIAS_NOMBRES[g.end]}`;
      
      return `${nombreRango} ${g.horario}`;
    });
    
  } catch (error) {
    console.error("Error obteniendo horarios:", error);
    return ["Error al cargar horarios"];
  }
}