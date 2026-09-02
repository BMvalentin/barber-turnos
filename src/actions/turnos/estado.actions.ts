"use server";

import { enviarEmailTurnoBarberoSeguro } from "@/lib/email/enviar-email-turno-barbero-seguro";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { actualizarTurnoEnTransaccion } from "@/lib/turnos/actualizar-turno-en-transaccion";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { ESTADOS_PAGO_MANUALES, ESTADOS_TURNO, MINIMO_ANTICIPACION_MS } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type { TurnoConDetalle } from "@/types/turno";
import type { Prisma, estado_pago, turno_estado } from "../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

type TurnoConDetalleCrudo = Prisma.turnoGetPayload<{
  include: typeof INCLUDE_TURNO_CON_DETALLE;
}>;

function serializarTurnoActualizado(turno: TurnoConDetalleCrudo): TurnoConDetalle {
  return {
    ...turno,
    precioCongelado: Number(turno.precioCongelado),
    seniaCongelada: Number(turno.seniaCongelada),
    servicio: {
      ...turno.servicio,
      precio: Number(turno.servicio.precio),
      senia: Number(turno.servicio.senia),
      descuento: Number(turno.servicio.descuento),
    },
  };
}

export async function actualizarTurno(
  prevState: ActionState<TurnoConDetalle>,
  formData: FormData,
): Promise<ActionState<TurnoConDetalle>> {
  try {
    const id = formData.get("id");
    if (typeof id !== "string" || !id) {
      return { success: false, error: "ID de turno no proporcionado" };
    }

    const sesion = await requerirAdmin();
    if (!sesion?.user?.id) return { success: false, error: "No autorizado" };

    const turnoActual = await prisma.turno.findUnique({
      where: { id },
      select: {
        servicioId: true,
        barberoId: true,
        horarioReservado: true,
        estado: true,
        estadoPago: true,
      },
    });
    if (!turnoActual) return { success: false, error: "Turno no encontrado" };

    const servicioId = formData.get("servicioId") || turnoActual.servicioId;
    const barberoId = formData.get("barberoId") || turnoActual.barberoId;
    const horarioRecibido = formData.get("horarioReservado") || turnoActual.horarioReservado.toISOString();
    if (typeof servicioId !== "string" || typeof barberoId !== "string" || typeof horarioRecibido !== "string") {
      return { success: false, error: "Datos inválidos" };
    }

    const horario = new Date(horarioRecibido);
    if (Number.isNaN(horario.getTime())) return { success: false, error: "Fecha inválida" };

    const estadoRecibido = formData.get("estado");
    const estado = (typeof estadoRecibido === "string" && estadoRecibido
      ? estadoRecibido
      : turnoActual.estado) as turno_estado;
    const estadoPagoRecibido = formData.get("estadoPago");
    const estadoPago = (
      typeof estadoPagoRecibido === "string" &&
      (ESTADOS_PAGO_MANUALES as readonly string[]).includes(estadoPagoRecibido)
        ? estadoPagoRecibido
        : turnoActual.estadoPago
    ) as estado_pago;

    const cambiaReserva =
      servicioId !== turnoActual.servicioId ||
      barberoId !== turnoActual.barberoId ||
      horario.getTime() !== turnoActual.horarioReservado.getTime();
    if (cambiaReserva && horario.getTime() <= Date.now() + MINIMO_ANTICIPACION_MS) {
      return { success: false, error: "El nuevo horario debe ser con al menos 10 minutos de anticipación" };
    }

    const resultado = await actualizarTurnoEnTransaccion({
      id,
      servicioId,
      barberoId,
      horario,
      estado,
      estadoPago,
      idUsuarioActual: sesion.user.id,
    });
    if (!resultado.ok) return { success: false, error: resultado.error };

    revalidarCacheTurno(
      resultado.turnoAnterior.barberoId,
      obtenerFechaSola(resultado.turnoAnterior.horarioReservado),
      resultado.turnoAnterior.userId,
    );
    revalidarCacheTurno(
      resultado.turno.barberoId,
      obtenerFechaSola(resultado.turno.horarioReservado),
      resultado.turno.userId,
    );
    enviarEmailTurnoSeguro(
      resultado.turno,
      resultado.turno.estado === ESTADOS_TURNO[3] ? ESTADOS_TURNO[3] : "ACTUALIZADO",
    );
    if (resultado.turno.estado === ESTADOS_TURNO[1] && resultado.turnoAnterior.estado !== ESTADOS_TURNO[1]) {
      enviarEmailTurnoBarberoSeguro(resultado.turno, "CONFIRMADO");
    }

    return { success: true, data: serializarTurnoActualizado(resultado.turno) };
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    return { success: false, error: "Error al actualizar el turno" };
  }
}
