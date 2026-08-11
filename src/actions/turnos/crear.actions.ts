"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { addMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { auth } from "@/auth";
import { enviarEmailTurno } from "@/lib/email";
import { existeLockAjeno } from "@/lib/locks";
import { entraEnMargen } from "@/lib/margenes";
import { obtenerContextoDeReserva } from "@/lib/contexto-reserva";
import { revalidarCacheTurno } from "@/lib/revalidar-turno";
import type { ActionState } from "@/types/action-state"; import type { TurnoConDetalle } from "@/types/turno";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export async function createTurno(
  prevState: ActionState<TurnoConDetalle>,
  formData: FormData,
): Promise<ActionState<TurnoConDetalle>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Iniciá sesión para reservar un turno" };
    const esAdmin = session.user.role === "ADMIN";
    const servicioId = formData.get("servicioId") as string;
    const userId = esAdmin ? (formData.get("userId") as string) : session.user.id;
    const barberoId = formData.get("barberoId") as string;
    const horarioStr = formData.get("horarioReservado") as string;
    if (!servicioId || !userId || !barberoId || !horarioStr) {
      return { success: false, error: "Datos incompletos" };
    }

    const inicio = new Date(horarioStr);
    if (isNaN(inicio.getTime())) return { success: false, error: "Fecha inválida" };
    const ahora = new Date();
    if (inicio.getTime() <= ahora.getTime() + 10 * 60 * 1000) {
      return { success: false, error: "Reservá con 10 minutos de anticipación" };
    }

    const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) return { success: false, error: "Servicio no encontrado" };
    const fin = addMinutes(inicio, servicio.duracion);
    const zonedInicio = toZonedTime(inicio, TIMEZONE);
    const fechaSolo = zonedInicio.toISOString().split("T")[0];

    const { diaLaboral, excepciones, turnosDelDia } = await obtenerContextoDeReserva(
      barberoId,
      zonedInicio.getDay(),
      inicio,
      fin,
    );

    if (excepciones.length > 0) return { success: false, error: excepciones[0].motivo };
    if (!diaLaboral) return { success: false, error: "El negocio está cerrado ese día" };
    const minInicio = zonedInicio.getHours() * 60 + zonedInicio.getMinutes();
    const minFin = minInicio + servicio.duracion;
    if (!entraEnMargen(diaLaboral.margenes, minInicio, minFin)) {
      return { success: false, error: "Horario fuera del rango laboral" };
    }

    const hayChoque = turnosDelDia.some((t) => {
      const tFin = addMinutes(new Date(t.horarioReservado), t.servicio.duracion);
      return inicio < tFin && fin > t.horarioReservado;
    });
    if (hayChoque) return { success: false, error: "Horario ocupado" };

    if (await existeLockAjeno(barberoId, inicio, userId)) {
      return { success: false, error: "Este horario está siendo seleccionado por otro usuario en este momento. Intentá con otro horario." };
    }

    const turno = await prisma.turno.create({
      data: {
        servicioId, userId, barberoId, horarioReservado: inicio,
        precioCongelado: servicio.precio, seniaCongelada: servicio.senia, estado: "PENDIENTE",
      },
      include: {
        user: { select: { id: true, name: true, email: true, telefono: true } },
        barbero: true, servicio: true,
      },
    });

    revalidarCacheTurno(barberoId, fechaSolo);
    revalidateTag(`turnos-mes-${barberoId}-${fechaSolo.substring(0, 7)}`);
    revalidateTag(`turnos-user-${userId}`);
    try { await prisma.slotLock.deleteMany({ where: { userId, barberoId, horarioReservado: inicio } }); } catch { /* No bloquear el flujo si falla la limpieza */ }
    void enviarEmailTurno(turno, "CREADO").catch((error) => console.error("Error enviando email de creación:", error));

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
    return { success: false, error: "Error al crear turno" };
  }
}