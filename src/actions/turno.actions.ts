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
    const servicioId = formData.get("servicioId") as string;
    const userId = formData.get("userId") as string;
    const barberoId = formData.get("barberoId") as string;
    const horarioStr = formData.get("horarioReservado") as string;

    if (!servicioId || !userId || !barberoId || !horarioStr) {
      return { success: false, error: "Datos incompletos" };
    }

    const inicio = fromZonedTime(horarioStr, TIMEZONE);
    const ahora = new Date();

    if (inicio <= addMinutes(ahora, 10)) {
      return { success: false, error: "Reservá con 10 minutos de anticipación" };
    }

    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId }
    });

    if (!servicio) {
      return { success: false, error: "Servicio no encontrado" };
    }

    const fin = addMinutes(inicio, servicio.duracion);

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
          estado: "PENDIENTE",
          horarioReservado: { gte: inicioDia, lte: finDia }
        },
        include: {
          servicio: { select: { duracion: true } }
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
    const minFin = minInicio + servicio.duracion;

    const entraEnMargen = diaLaboral.margenes.some((m) =>
      minInicio >= timeToMinutes(m.desde) &&
      minFin <= timeToMinutes(m.hasta)
    );

    if (!entraEnMargen) {
      return { success: false, error: "Horario fuera del rango laboral" };
    }

    const hayChoque = turnosDelDia.some((t) => {
      const tFin = addMinutes(t.horarioReservado, t.servicio.duracion);
      return inicio < tFin && fin > t.horarioReservado;
    });

    if (hayChoque) {
      return { success: false, error: "Horario ocupado" };
    }

    const turno = await prisma.turno.create({
      data: {
        servicioId,
        userId,
        barberoId,
        horarioReservado: inicio,
        precioCongelado: servicio.precio,
        seniaCongelada: servicio.senia,
        estado: "PENDIENTE"
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
    const where: any = {
      estado: "PENDIENTE"

    };

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
        servicio: { select: { nombre: true, duracion: true } },
        barbero: { select: { nombre: true } }
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
      include: { servicio: true }
    });

    if (!turnoActual) {
      return { success: false, error: "Turno no encontrado" };
    }

    const inicio = horarioStr
      ? fromZonedTime(horarioStr, TIMEZONE)
      : turnoActual.horarioReservado;

    const fin = addMinutes(inicio, turnoActual.servicio.duracion);

    const fechaLocal = toZonedTime(inicio, TIMEZONE);
    const fechaISO = fechaLocal.toISOString().split("T")[0];

    const inicioDia = fromZonedTime(`${fechaISO} 00:00:00`, TIMEZONE);
    const finDia = fromZonedTime(`${fechaISO} 23:59:59`, TIMEZONE);
    const diaSemana = fechaLocal.getDay();

    const [diaLaboral, turnosDelDia] = await Promise.all([
      prisma.dia_laboral.findFirst({
        where: { dia: diaSemana, estado: true },
        include: { margenes: { where: { estado: true } } }
      }),
      prisma.turno.findMany({
        where: {
          estado: "PENDIENTE",
          horarioReservado: { gte: inicioDia, lte: finDia },
          id: { not: id }
        },
        include: { servicio: { select: { duracion: true } } }
      })
    ]);

    if (!diaLaboral) {
      return { success: false, error: "Horario no disponible" };
    }

    const minInicio = getMinutesFromZonedDate(inicio);
    const minFin = minInicio + turnoActual.servicio.duracion;

    const entra = diaLaboral.margenes.some(m =>
      minInicio >= timeToMinutes(m.desde) &&
      minFin <= timeToMinutes(m.hasta)
    );

    if (!entra) {
      return { success: false, error: "Fuera del horario laboral" };
    }

    const hayChoque = turnosDelDia.some(t => {
      const tFin = addMinutes(t.horarioReservado, t.servicio.duracion);
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
   CANCELAR TURNO
========================= */

export async function deleteTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID requerido" };

  await prisma.turno.update({
    where: { id },
    data: { estado: "CANCELADO" }
  });

  revalidatePath("/turno");
  return { success: true };
}

/* =========================
   COMPLETAR TURNO
========================= */

export async function completedTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID requerido" };

  await prisma.turno.update({
    where: { id },
    data: { estado: "COMPLETADO" }
  });

  revalidatePath("/turno");
  return { success: true };
}

export async function obtenerHorariosDisponibles(
  fecha: string,
  servicioId: string,
  barberoId: string,
  turnoIdAExcluir?: string
) {
  try {
    if (!fecha || !servicioId || !barberoId) {
      return { success: false, error: "Datos incompletos" };
    }

    // Obtener duración del servicio
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
      select: { duracion: true },
    });

    if (!servicio) {
      return { success: false, error: "Servicio no encontrado" };
    }

    const duracion = servicio.duracion;

    // Horario laboral fijo (puedes mover esto a config después)
    const HORA_INICIO = 9;
    const HORA_FIN = 20;
    const INTERVALO = 30; // minutos entre slots

    const fechaInicio = new Date(`${fecha}T00:00:00`);
    const fechaFin = new Date(`${fecha}T23:59:59`);

    // Traer turnos del día para ese barbero
    const turnosDelDia = await prisma.turno.findMany({
      where: {
        barberoId,
        horarioReservado: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: {
          not: "CANCELADO",
        },
        ...(turnoIdAExcluir && {
          NOT: { id: turnoIdAExcluir },
        }),
      },
      select: {
        horarioReservado: true,
        servicio: {
          select: { duracion: true },
        },
      },
    });

    const slots: string[] = [];

    for (
      let hora = HORA_INICIO * 60;
      hora + duracion <= HORA_FIN * 60;
      hora += INTERVALO
    ) {
      const horas = Math.floor(hora / 60);
      const minutos = hora % 60;

      const inicioSlot = new Date(fechaInicio);
      inicioSlot.setHours(horas, minutos, 0, 0);

      const finSlot = new Date(inicioSlot);
      finSlot.setMinutes(finSlot.getMinutes() + duracion);

      const haySuperposicion = turnosDelDia.some((turno) => {
        const inicioExistente = new Date(turno.horarioReservado);
        const finExistente = new Date(inicioExistente);
        finExistente.setMinutes(
          finExistente.getMinutes() + turno.servicio.duracion
        );

        return (
          inicioSlot < finExistente &&
          finSlot > inicioExistente
        );
      });

      if (!haySuperposicion) {
        slots.push(inicioSlot.toISOString());
      }
    }

    return { success: true, data: slots };
  } catch (error) {
    console.error("Error en obtenerHorariosDisponibles:", error);
    return { success: false, error: "Error del servidor" };
  }
}
