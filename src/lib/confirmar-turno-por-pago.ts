import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO } from "@/lib/constants";
import { evaluarPagoTurno } from "@/lib/mercadopago/evaluar-pago-turno";
import { enviarEmailsTurnoConfirmado } from "@/lib/email/enviar-emails-turno-confirmado";
import { enviarAvisoPushTurno } from "@/lib/notificaciones/enviar-aviso-push-turno";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";

export type ResultadoConfirmacionPago = {
  ok: boolean;
  yaConfirmado?: boolean;
  turnoId?: string;
  error?: string;
};

/**
 * Helper transversal que valida un pago de Mercado Pago y confirma el turno
 * (pasándolo a CONFIRMADO y guardando estadoPago/tipoPago/mpPaymentId). Lo
 * consumen la server action `confirmarPagoTurno` y el webhook de Mercado Pago
 * para evitar lógica duplicada/divergente.
 *
 * La confirmación es IDEMPOTENTE: se hace con `updateMany` sobre
 * `estado = PENDIENTE`. Si la fila no coincide (`count === 0`), se vuelve a
 * consultar el estado y el ID de pago antes de aceptar el reintento.
 */
export async function confirmarTurnoPorPago(args: {
  turnoId: string;
  estadoPago: string;
  referencia: string;
  montoPago: number;
  paymentId: string;
  tipoPago?: string;
}): Promise<ResultadoConfirmacionPago> {
  const turno = await prisma.turno.findUnique({
    where: { id: args.turnoId },
    include: INCLUDE_TURNO_CON_DETALLE,
  });

  if (!turno) return { ok: false, error: "Turno no encontrado" };

  const validacion = evaluarPagoTurno({
    turnoId: turno.id,
    estado: turno.estado,
    tipoPagoAlmacenado: turno.tipoPago,
    precioCongelado: Number(turno.precioCongelado),
    seniaCongelada: Number(turno.seniaCongelada),
    estadoPago: args.estadoPago,
    referencia: args.referencia,
    montoPago: args.montoPago,
    tipoPago: args.tipoPago,
  });

  if (!validacion.ok) return { ok: false, error: validacion.error };
  if (validacion.yaConfirmado) {
    if (turno.mpPaymentId !== args.paymentId || turno.metodoPago !== "MERCADO_PAGO") {
      return { ok: false, error: "El pago no coincide con el turno confirmado" };
    }
    return { ok: true, yaConfirmado: true, turnoId: turno.id };
  }

  const claveSlot = `${turno.barberoId}|${turno.horarioReservado.toISOString()}`;
  if (turno.claveSlot !== claveSlot) {
    return { ok: false, error: "El turno ya no tiene un horario reservado" };
  }

  const cambios = {
    estado: ESTADOS_TURNO[1],
    estadoPago: validacion.nuevoEstadoPago,
    tipoPago: validacion.tipoPagoGuardar,
    metodoPago: "MERCADO_PAGO",
    mpPaymentId: args.paymentId,
  };
  const resultado = await prisma.turno.updateMany({
    where: {
      id: turno.id,
      estado: ESTADOS_TURNO[0],
      claveSlot,
      tipoPago: turno.tipoPago,
      precioCongelado: turno.precioCongelado,
      seniaCongelada: turno.seniaCongelada,
    },
    data: cambios,
  });
  if (resultado.count === 0) {
    const turnoActual = await prisma.turno.findUnique({
      where: { id: turno.id },
      select: { estado: true, mpPaymentId: true, metodoPago: true },
    });
    if ((turnoActual?.estado === ESTADOS_TURNO[1] || turnoActual?.estado === ESTADOS_TURNO[2]) &&
      turnoActual.mpPaymentId === args.paymentId && turnoActual.metodoPago === "MERCADO_PAGO") {
      return { ok: true, yaConfirmado: true, turnoId: turno.id };
    }
    return { ok: false, error: "El turno ya no admite pagos" };
  }

  // Solo la transición que confirma la fila programa los avisos.
  const turnoConfirmado = { ...turno, ...cambios };
  after(async () => {
    await Promise.allSettled([
      enviarEmailsTurnoConfirmado(turnoConfirmado),
      enviarAvisoPushTurno(turnoConfirmado, "CONFIRMADO"),
    ]);
  });
  revalidarCacheTurno(turno.barberoId, obtenerFechaSola(turno.horarioReservado), turno.userId);

  return { ok: true, turnoId: turno.id };
}
