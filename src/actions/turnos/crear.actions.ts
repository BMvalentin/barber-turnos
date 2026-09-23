"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { enviarEmailTurnoBarberoSeguro } from "@/lib/email/enviar-email-turno-barbero-seguro";
import { serializarTurnoConDetalle } from "@/lib/serializar-turno-con-detalle";
import { crearTurnoEnTransaccion } from "@/lib/crear-turno-transaccion";
import { revalidarDisponibilidadTurno } from "@/lib/turnos/revalidar-disponibilidad-turno";
import { MINIMO_ANTICIPACION_MS, ESTADOS_TURNO, ESTADOS_PAGO, ESTADOS_PAGO_MANUALES } from "@/lib/constants";
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
    // Para clientes normales el rol firmado del JWT alcanza para descartar
    // privilegios. Un supuesto admin siempre se confirma contra la BD.
    const usuarioEsAdmin = session.user.role === "ADMIN" && Boolean(await requerirAdmin());
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
    const estadoPago = usuarioEsAdmin && (ESTADOS_PAGO_MANUALES as readonly string[]).includes(estadoPagoRaw) ? (estadoPagoRaw as (typeof ESTADOS_PAGO_MANUALES)[number]) : ESTADOS_PAGO[0];
    const estadoFinal = estadoPago === ESTADOS_PAGO[1] || estadoPago === ESTADOS_PAGO[2] ? ESTADOS_TURNO[1] : ESTADOS_TURNO[0];
    const resultado = await crearTurnoEnTransaccion({
      servicioId,
      userId,
      barberoId,
      idUsuarioActual: session.user.id,
      inicio,
      estadoPago,
      estadoFinal,
    });
    if (!resultado.ok) return { success: false, error: resultado.error };
    const turno = resultado.turno;
    revalidarDisponibilidadTurno(barberoId, obtenerFechaSola(inicio), userId);
    after(async () => {
      const tareas: Promise<unknown>[] = [
        prisma.slotLock.deleteMany({ where: { userId, barberoId, horarioReservado: inicio } }),
      ];
      if (resultado.creado) {
        const estadoEmail = estadoFinal === ESTADOS_TURNO[1] ? "CONFIRMADO" : "CREADO";
        tareas.push(
          enviarEmailTurnoSeguro(turno, estadoEmail),
          enviarEmailTurnoBarberoSeguro(turno, estadoEmail),
        );
      }
      const resultados = await Promise.allSettled(tareas);
      for (const resultadoTarea of resultados) {
        if (resultadoTarea.status === "rejected") {
          console.error(
            "Error en tarea posterior a la creación del turno:",
            resultadoTarea.reason,
          );
        }
      }
    });
    return { success: true, data: serializarTurnoConDetalle(turno) };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear turno" };
  }
}
