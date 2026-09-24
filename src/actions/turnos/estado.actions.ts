"use server";

import { enviarEmailTurnoBarberoSeguro } from "@/lib/email/enviar-email-turno-barbero-seguro";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { actualizarTurnoEnTransaccion } from "@/lib/turnos/actualizar-turno-en-transaccion";
import { serializarTurnoConDetalle } from "@/lib/serializar-turno-con-detalle";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { ESTADOS_PAGO, ESTADOS_PAGO_MANUALES, ESTADOS_TURNO, MINIMO_ANTICIPACION_MS } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type { TurnoConDetalle } from "@/types/turno";
import type { turno_estado } from "../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

function esEstadoTurno(valor: unknown): valor is turno_estado {
  return typeof valor === "string" && ESTADOS_TURNO.some((estado) => estado === valor);
}

function esEstadoPagoManual(valor: unknown): valor is (typeof ESTADOS_PAGO_MANUALES)[number] {
  return typeof valor === "string" && ESTADOS_PAGO_MANUALES.some((estado) => estado === valor);
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
    if (estadoRecibido !== null && !esEstadoTurno(estadoRecibido)) {
      return { success: false, error: "Estado de turno inválido" };
    }
    const estado = estadoRecibido ?? turnoActual.estado;
    const estadoPagoRecibido = formData.get("estadoPago");
    if (
      estadoPagoRecibido !== null &&
      !esEstadoPagoManual(estadoPagoRecibido) &&
      estadoPagoRecibido !== turnoActual.estadoPago
    ) {
      return { success: false, error: "Estado de pago inválido" };
    }
    const estadoPago = (
      estado === ESTADOS_TURNO[3]
        ? ESTADOS_PAGO[4]
        : estadoPagoRecibido !== null
          ? estadoPagoRecibido
          : turnoActual.estadoPago
    );

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

    return { success: true, data: serializarTurnoConDetalle(resultado.turno) };
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    return { success: false, error: "Error al actualizar el turno" };
  }
}
