"use server";

import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { enviarEmailTurnoBarberoSeguro } from "@/lib/email/enviar-email-turno-barbero-seguro";
import { existeLockAjeno } from "@/lib/locks";
import { entraEnMargen } from "@/lib/margenes";
import { obtenerContextoDeReserva } from "@/lib/contexto-reserva";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { obtenerServicioPorId } from "@/lib/consultas/obtener-servicio-por-id";
import { ZONA_HORARIA, MINIMO_ANTICIPACION_MS, ESTADOS_TURNO } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state"; import type { TurnoConDetalle } from "@/types/turno";

export async function createTurno(
  prevState: ActionState<TurnoConDetalle>,
  formData: FormData,
): Promise<ActionState<TurnoConDetalle>> {
  try {
    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "Iniciá sesión para reservar un turno" };
    const usuarioEsAdmin = esAdmin(session);
    const servicioId = formData.get("servicioId") as string;
    const userId = usuarioEsAdmin ? (formData.get("userId") as string) : session.user.id;
    const barberoId = formData.get("barberoId") as string;
    const horarioStr = formData.get("horarioReservado") as string;
    if (!servicioId || !userId || !barberoId || !horarioStr) {
      return { success: false, error: "Datos incompletos" };
    }

    const inicio = new Date(horarioStr);
    if (isNaN(inicio.getTime())) return { success: false, error: "Fecha inválida" };
    const ahora = new Date();
    if (inicio.getTime() <= ahora.getTime() + MINIMO_ANTICIPACION_MS) {
      return { success: false, error: "Reservá con 10 minutos de anticipación" };
    }

    const servicio = await obtenerServicioPorId(servicioId);
    if (!servicio) return { success: false, error: "Servicio no encontrado" };
    const fin = addMinutes(inicio, servicio.duracion);
    const zonedInicio = toZonedTime(inicio, ZONA_HORARIA);
    const fechaSolo = obtenerFechaSola(inicio);

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

    if (await existeLockAjeno(barberoId, inicio, session.user.id)) {
      return { success: false, error: "Este horario está siendo seleccionado por otro usuario en este momento. Intentá con otro horario." };
    }

    const turno = await prisma.turno.create({
      data: {
        servicioId, userId, barberoId, horarioReservado: inicio,
        precioCongelado: servicio.precio, seniaCongelada: servicio.senia, estado: ESTADOS_TURNO[0],
      },
      include: INCLUDE_TURNO_CON_DETALLE,
    });

    revalidarCacheTurno(barberoId, fechaSolo, userId);
    try { await prisma.slotLock.deleteMany({ where: { userId, barberoId, horarioReservado: inicio } }); } catch { /* No bloquear el flujo si falla la limpieza */ }
    enviarEmailTurnoSeguro(turno, "CREADO");
    enviarEmailTurnoBarberoSeguro(turno, "CREADO");

    return {
      success: true,
      data: {
        ...turno,
        precioCongelado: Number(turno.precioCongelado),
        seniaCongelada: Number(turno.seniaCongelada),
        servicio: {
          ...turno.servicio,
          precio: Number(turno.servicio.precio),
          senia: Number(turno.servicio.senia),
          descuento: Number(turno.servicio.descuento),
        },
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear turno" };
  }
}