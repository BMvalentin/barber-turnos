"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { addMinutes } from "date-fns";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type ActionState = {
  success?: boolean;
  error?: string;
  data?: any;
};

/* =========================
   Helpers
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
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const turnoServicioId = formData.get("turnoServicioId") as string;
    const userId = formData.get("userId") as string;
    const horarioStr = formData.get("horarioReservado") as string;

    if (!turnoServicioId || !userId || !horarioStr) {
      return { success: false, error: "Datos incompletos" };
    }

    const inicio = fromZonedTime(horarioStr, TIMEZONE);
    const ahora = new Date();

    if (inicio <= addMinutes(ahora, 10)) {
      return { success: false, error: "Reservá con 10 minutos de anticipación" };
    }

    const turnoServicio = await prisma.turno_servicio.findUnique({
      where: { id: turnoServicioId }
    });

    if (!turnoServicio) {
      return { success: false, error: "Servicio no encontrado" };
    }

    const fin = addMinutes(inicio, turnoServicio.duracion);

    const fechaLocal = toZonedTime(inicio, TIMEZONE);
    const fechaISO = fechaLocal.toISOString().split("T")[0];

    const inicioDia = fromZonedTime(`${fechaISO} 00:00:00`, TIMEZONE);
    const finDia = fromZonedTime(`${fechaISO} 23:59:59`, TIMEZONE);
    const diaSemana = fechaLocal.getDay();

    const [diaLaboral, excepciones, turnosDelDia] = await Promise.all([
      prisma.dia_laboral.findFirst({
        where: { dia: diaSemana, estado: true },
        include: { margenes: { where: { estado: true } } }
      }),
      prisma.excepcion_laboral.findMany({
        where: {
          estado: true,
          desde: { lte: fin },
          hasta: { gte: inicio }
        }
      }),
      prisma.turno.findMany({
        where: {
          estado: 1,
          horarioReservado: { gte: inicioDia, lte: finDia }
        },
        include: {
          turnoServicio: { select: { duracion: true } }
        }
      })
    ]);

    if (excepciones.length > 0) {
      return { success: false, error: excepciones[0].motivo };
    }

    if (!diaLaboral) {
      return { success: false, error: "El negocio está cerrado ese día" };
    }

    const minInicio = getMinutesFromZonedDate(inicio);
    const minFin = minInicio + turnoServicio.duracion;

    const entraEnMargen = diaLaboral.margenes.some((m) =>
      minInicio >= timeToMinutes(m.desde) &&
      minFin <= timeToMinutes(m.hasta)
    );

    if (!entraEnMargen) {
      return { success: false, error: "Horario fuera del rango laboral" };
    }

    const hayChoque = turnosDelDia.some((t) => {
      const tInicio = t.horarioReservado;
      const tFin = addMinutes(tInicio, t.turnoServicio.duracion);
      return inicio < tFin && fin > tInicio;
    });

    if (hayChoque) {
      return { success: false, error: "Horario ocupado" };
    }

    const turno = await prisma.turno.create({
      data: {
        turnoXServicioId: turnoServicioId,
        userId,
        horarioReservado: inicio,
        precioCongelado: turnoServicio.precio,
        seniaCongelada: turnoServicio.senia,
        estado: 1
      }
    });

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

export async function getTurnos(params?: {
  userId?: string;
  fecha?: string;
}): Promise<ActionState> {
  try {
    const where: any = { estado: 1 };

    if (params?.userId) where.userId = params.userId;

    if (params?.fecha) {
      const inicio = fromZonedTime(`${params.fecha} 00:00:00`, TIMEZONE);
      const fin = fromZonedTime(`${params.fecha} 23:59:59`, TIMEZONE);
      where.horarioReservado = { gte: inicio, lte: fin };
    }

    const turnos = await prisma.turno.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        turnoServicio: {
          include: {
            servicio: { select: { nombre: true } }
          }
        }
      },
      orderBy: { horarioReservado: "asc" }
    });

    return {
      success: true,
      data: turnos.map(t => ({
        ...t,
        precioCongelado: Number(t.precioCongelado),
        seniaCongelada: Number(t.seniaCongelada)
      }))
    };

  } catch (error) {
    return { success: false, error: "Error al obtener turnos" };
  }
}

/* =========================
   UPDATE TURNO
========================= */

export async function actualizarTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    const horarioStr = formData.get("horarioReservado") as string;

    if (!id) return { success: false, error: "ID requerido" };

    const turnoActual = await prisma.turno.findUnique({
      where: { id },
      include: { turnoServicio: true }
    });

    if (!turnoActual) {
      return { success: false, error: "Turno no encontrado" };
    }

    const inicio = horarioStr
      ? fromZonedTime(horarioStr, TIMEZONE)
      : turnoActual.horarioReservado;

    const fin = addMinutes(inicio, turnoActual.turnoServicio.duracion);

    const fechaLocal = toZonedTime(inicio, TIMEZONE);
    const fechaISO = fechaLocal.toISOString().split("T")[0];

    const inicioDia = fromZonedTime(`${fechaISO} 00:00:00`, TIMEZONE);
    const finDia = fromZonedTime(`${fechaISO} 23:59:59`, TIMEZONE);
    const diaSemana = fechaLocal.getDay();

    const [diaLaboral, excepciones, turnosDelDia] = await Promise.all([
      prisma.dia_laboral.findFirst({
        where: { dia: diaSemana, estado: true },
        include: { margenes: { where: { estado: true } } }
      }),
      prisma.excepcion_laboral.findMany({
        where: {
          estado: true,
          desde: { lte: fin },
          hasta: { gte: inicio }
        }
      }),
      prisma.turno.findMany({
        where: {
          estado: 1,
          horarioReservado: { gte: inicioDia, lte: finDia },
          id: { not: id }
        },
        include: { turnoServicio: { select: { duracion: true } } }
      })
    ]);

    if (!diaLaboral || excepciones.length > 0) {
      return { success: false, error: "Horario no disponible" };
    }

    const minInicio = getMinutesFromZonedDate(inicio);
    const minFin = minInicio + turnoActual.turnoServicio.duracion;

    const entra = diaLaboral.margenes.some(m =>
      minInicio >= timeToMinutes(m.desde) &&
      minFin <= timeToMinutes(m.hasta)
    );

    if (!entra) {
      return { success: false, error: "Fuera del horario laboral" };
    }

    const hayChoque = turnosDelDia.some(t => {
      const tFin = addMinutes(t.horarioReservado, t.turnoServicio.duracion);
      return inicio < tFin && fin > t.horarioReservado;
    });

    if (hayChoque) {
      return { success: false, error: "Horario ocupado" };
    }

    const turno = await prisma.turno.update({
      where: { id },
      data: { horarioReservado: inicio }
    });

    revalidatePath("/turno");

    return { success: true, data: turno };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al actualizar turno" };
  }
}

/* =========================
   DELETE / COMPLETE
========================= */

export async function deleteTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID requerido" };

  await prisma.turno.update({
    where: { id },
    data: { estado: 0 }
  });

  revalidatePath("/turno");
  return { success: true };
}

export async function completedTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID requerido" };

  await prisma.turno.update({
    where: { id },
    data: { estado: 2 }
  });

  revalidatePath("/turno");
  return { success: true };
}
