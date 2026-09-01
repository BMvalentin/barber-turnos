"use server";

import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { enviarEmailTurnoBarberoSeguro } from "@/lib/email/enviar-email-turno-barbero-seguro";
import { enviarEmailsTurnoConfirmado } from "@/lib/email/enviar-emails-turno-confirmado";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { obtenerServicioPorId } from "@/lib/consultas/obtener-servicio-por-id";
import { obtenerTurnoDuplicado } from "@/lib/consultas/obtener-turno-duplicado";
import { serializarTurnoConDetalle } from "@/lib/serializar-turno-con-detalle";
import { crearTurnoEnTransaccion } from "@/lib/crear-turno-transaccion";
import { ZONA_HORARIA, MINIMO_ANTICIPACION_MS, ESTADOS_TURNO, ESTADOS_PAGO, ESTADOS_PAGO_MANUALES } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state";
import type { TurnoConDetalle } from "@/types/turno";

export async function createTurno(
  prevState: ActionState<TurnoConDetalle>,
  formData: FormData,
): Promise<ActionState<TurnoConDetalle>> {
  try {
    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "Iniciá sesión para reservar un turno" };
    const usuarioEsAdmin = esAdmin(session);
    const estadoPagoRaw = formData.get("estadoPago") as string;
    const servicioId = formData.get("servicioId") as string;
    const userId = usuarioEsAdmin ? (formData.get("userId") as string) : session.user.id;
    const barberoId = formData.get("barberoId") as string;
    const horarioStr = formData.get("horarioReservado") as string;
    if (!servicioId || !userId || !barberoId || !horarioStr) {
      return { success: false, error: "Datos incompletos" };
    }
    if (!usuarioEsAdmin && !session.user.telefono) {
      return { success: false, error: "Completá tu teléfono en tu perfil antes de reservar un turno" };
    }
    const inicio = new Date(horarioStr);
    if (isNaN(inicio.getTime())) return { success: false, error: "Fecha inválida" };
    const ahora = new Date();
    if (inicio.getTime() <= ahora.getTime() + MINIMO_ANTICIPACION_MS) {
      return { success: false, error: "Reservá con 10 minutos de anticipación" };
    }
    const turnoDuplicado = await obtenerTurnoDuplicado({ userId, barberoId, horarioReservado: inicio });
    if (turnoDuplicado) {
      try { await prisma.slotLock.deleteMany({ where: { userId, barberoId, horarioReservado: inicio } }); } catch { /* No bloquear el flujo si falla la limpieza */ }
      revalidarCacheTurno(barberoId, obtenerFechaSola(inicio), userId);
      return { success: true, data: serializarTurnoConDetalle(turnoDuplicado) };
    }
    const servicio = await obtenerServicioPorId(servicioId);
    if (!servicio) return { success: false, error: "Servicio no encontrado" };
    const zonedInicio = toZonedTime(inicio, ZONA_HORARIA);
    const estadoPago = usuarioEsAdmin && (ESTADOS_PAGO_MANUALES as readonly string[]).includes(estadoPagoRaw) ? (estadoPagoRaw as (typeof ESTADOS_PAGO_MANUALES)[number]) : ESTADOS_PAGO[0];
    const estadoFinal = estadoPago === ESTADOS_PAGO[1] || estadoPago === ESTADOS_PAGO[2] ? ESTADOS_TURNO[1] : ESTADOS_TURNO[0];
    const resultado = await crearTurnoEnTransaccion({
      servicioId,
      userId,
      barberoId,
      idUsuarioActual: session.user.id,
      inicio,
      fin: addMinutes(inicio, servicio.duracion),
      diaSemana: zonedInicio.getDay(),
      minInicio: zonedInicio.getHours() * 60 + zonedInicio.getMinutes(),
      duracion: servicio.duracion,
      precioCongelado: Number(servicio.precio),
      seniaCongelada: Number(servicio.senia),
      estadoPago,
      estadoFinal,
    });
    if (!resultado.ok) return { success: false, error: resultado.error };
    const turno = resultado.turno;
    revalidarCacheTurno(barberoId, obtenerFechaSola(inicio), userId);
    try { await prisma.slotLock.deleteMany({ where: { userId, barberoId, horarioReservado: inicio } }); } catch { /* No bloquear el flujo si falla la limpieza */ }
    if (estadoFinal === ESTADOS_TURNO[1]) enviarEmailsTurnoConfirmado(turno);
    else { enviarEmailTurnoSeguro(turno, "CREADO"); enviarEmailTurnoBarberoSeguro(turno, "CREADO"); }
    return { success: true, data: serializarTurnoConDetalle(turno) };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear turno" };
  }
}
