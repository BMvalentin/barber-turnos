"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type ActionState = {
  success: boolean;
  error?: string;
  data?: any;
};

/* =========================
   HELPERS
========================= */

function getMinutesFromZonedDate(date: Date): number {
  const zoned = toZonedTime(date, TIMEZONE);
  return zoned.getHours() * 60 + zoned.getMinutes();
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/* =========================
   CREATE TURNO
========================= */

export async function createTurno(
  prevState: any,
  formData: FormData
) {
  try {
    const nombre = formData.get("nombre") as string;
    const telefono = formData.get("telefono") as string;
    const servicioId = formData.get("servicioId") as string;
    const fechaString = formData.get("fecha") as string;
    const horaString = formData.get("hora") as string;

    if (!nombre || !telefono || !servicioId || !fechaString || !horaString) {
      return { success: false, error: "Faltan datos" };
    }

    // 🔥 UNIMOS FECHA + HORA CORRECTAMENTE
    const fechaCompleta = new Date(`${fechaString}T${horaString}:00`);

    const turno = await prisma.turno.create({
      data: {
        nombre,
        telefono,
        servicioId,
        fecha: fechaCompleta,
        estado: "PENDIENTE",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/turno");

    return { success: true, data: turno };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear turno" };
  }
}
/* =========================
   GET TURNOS
========================= */

export async function getTurnos(): Promise<ActionState> {
  try {
    const turnos = await prisma.turno.findMany({
      where: { estado: "PENDIENTE" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        servicio: { select: { nombre: true, duracion: true } },
        barbero: { select: { nombre: true } },
      },
      orderBy: { horarioReservado: "asc" },
    });

    return {
      success: true,
      data: turnos.map((t) => ({
        ...t,
        precioCongelado: Number(t.precioCongelado),
        seniaCongelada: Number(t.seniaCongelada),
      })),
    };
  } catch {
    return { success: false, error: "Error al obtener turnos" };
  }
}

/* =========================
   ACTUALIZAR TURNO
========================= */

export async function actualizarTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    const horarioStr = formData.get("horarioReservado") as string;

    if (!id || !horarioStr) {
      return { success: false, error: "Datos incompletos" };
    }

    const inicio = new Date(horarioStr);

    if (isNaN(inicio.getTime())) {
      return { success: false, error: "Fecha inválida" };
    }

    const turnoActual = await prisma.turno.findUnique({
      where: { id },
      include: {
        servicio: { select: { duracion: true } },
      },
    });

    if (!turnoActual) {
      return { success: false, error: "Turno no encontrado" };
    }

    const fin = addMinutes(inicio, turnoActual.servicio.duracion);

    const fechaLocal = toZonedTime(inicio, TIMEZONE);
    const diaSemana = fechaLocal.getDay();

    const inicioDia = new Date(
      fechaLocal.getFullYear(),
      fechaLocal.getMonth(),
      fechaLocal.getDate(),
      0, 0, 0
    );

    const finDia = new Date(
      fechaLocal.getFullYear(),
      fechaLocal.getMonth(),
      fechaLocal.getDate(),
      23, 59, 59
    );

    const [diaLaboral, turnosDelDia] = await Promise.all([
      prisma.dia_laboral.findFirst({
        where: { dia: diaSemana, estado: true },
        include: { margenes: { where: { estado: true } } },
      }),

      prisma.turno.findMany({
        where: {
          id: { not: id },
          estado: "PENDIENTE",
          horarioReservado: { gte: inicioDia, lte: finDia },
        },
        include: {
          servicio: { select: { duracion: true } },
        },
      }),
    ]);

    if (!diaLaboral) {
      return { success: false, error: "El negocio está cerrado ese día" };
    }

    const minInicio =
      fechaLocal.getHours() * 60 + fechaLocal.getMinutes();
    const minFin = minInicio + turnoActual.servicio.duracion;

    const entraEnMargen = diaLaboral.margenes.some((m) => {
      const [hDesde, mDesde] = m.desde.split(":").map(Number);
      const [hHasta, mHasta] = m.hasta.split(":").map(Number);

      const desdeMin = hDesde * 60 + mDesde;
      const hastaMin = hHasta * 60 + mHasta;

      return minInicio >= desdeMin && minFin <= hastaMin;
    });

    if (!entraEnMargen) {
      return { success: false, error: "Horario fuera del rango laboral" };
    }

    const hayChoque = turnosDelDia.some((t) => {
      const tFin = addMinutes(
        new Date(t.horarioReservado),
        t.servicio.duracion
      );
      return inicio < tFin && fin > t.horarioReservado;
    });

    if (hayChoque) {
      return { success: false, error: "Horario ocupado" };
    }

    const turnoActualizado = await prisma.turno.update({
      where: { id },
      data: { horarioReservado: inicio },
    });

    revalidatePath("/turno");

    return {
      success: true,
      data: {
        ...turnoActualizado,
        precioCongelado: Number(turnoActualizado.precioCongelado),
        seniaCongelada: Number(turnoActualizado.seniaCongelada),
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al actualizar turno" };
  }
}

/* =========================
   OBTENER HORARIOS DISPONIBLES
========================= */

export async function obtenerHorariosDisponibles(
  servicioId: string,
  fecha: string
): Promise<string[]> {
  try {
    if (!servicioId || !fecha) return [];

    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) return [];

    const fechaBase = new Date(fecha);
    if (isNaN(fechaBase.getTime())) return [];

    const fechaLocal = toZonedTime(fechaBase, TIMEZONE);
    const diaSemana = fechaLocal.getDay();

    const inicioDia = new Date(
      fechaLocal.getFullYear(),
      fechaLocal.getMonth(),
      fechaLocal.getDate(),
      0, 0, 0
    );

    const finDia = new Date(
      fechaLocal.getFullYear(),
      fechaLocal.getMonth(),
      fechaLocal.getDate(),
      23, 59, 59
    );

    const [diaLaboral, turnosDelDia] = await Promise.all([
      prisma.dia_laboral.findFirst({
        where: { dia: diaSemana, estado: true },
        include: { margenes: { where: { estado: true } } },
      }),

      prisma.turno.findMany({
        where: {
          estado: "PENDIENTE",
          horarioReservado: { gte: inicioDia, lte: finDia },
        },
        include: {
          servicio: { select: { duracion: true } },
        },
      }),
    ]);

    if (!diaLaboral) return [];

    const duracionServicio = servicio.duracion;
    const horariosDisponibles: string[] = [];

    for (const margen of diaLaboral.margenes) {
      const [hDesde, mDesde] = margen.desde.split(":").map(Number);
      const [hHasta, mHasta] = margen.hasta.split(":").map(Number);

      let inicioMin = hDesde * 60 + mDesde;
      const finMin = hHasta * 60 + mHasta;

      while (inicioMin + duracionServicio <= finMin) {
        const hora = Math.floor(inicioMin / 60)
          .toString()
          .padStart(2, "0");
        const minutos = (inicioMin % 60)
          .toString()
          .padStart(2, "0");

        const horarioStr = `${hora}:${minutos}`;

        const inicioTurno = new Date(
          fechaLocal.getFullYear(),
          fechaLocal.getMonth(),
          fechaLocal.getDate(),
          Number(hora),
          Number(minutos),
          0
        );

        const finTurno = addMinutes(inicioTurno, duracionServicio);

        const hayChoque = turnosDelDia.some((t) => {
          const tFin = addMinutes(
            new Date(t.horarioReservado),
            t.servicio.duracion
          );
          return inicioTurno < tFin && finTurno > t.horarioReservado;
        });

        if (!hayChoque) {
          horariosDisponibles.push(horarioStr);
        }

        inicioMin += 15; // intervalos de 15 minutos
      }
    }

    return horariosDisponibles;
  } catch (error) {
    console.error(error);
    return [];
  }
}
/* =========================
   COMPLETAR TURNO
========================= */

export async function completedTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID inválido" };
    }

    const turno = await prisma.turno.update({
      where: { id },
      data: { estado: "COMPLETADO" },
    });

    revalidatePath("/admin");
    revalidatePath("/turno");

    return {
      success: true,
      data: {
        ...turno,
        precioCongelado: Number(turno.precioCongelado),
        seniaCongelada: Number(turno.seniaCongelada),
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al completar turno" };
  }
}

/* =========================
   ELIMINAR TURNO
========================= */
export async function deleteTurno(
  prevState: any,
  formData: FormData
) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID inválido" };
    }

    await prisma.turno.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/turno");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar turno" };
  }
}
