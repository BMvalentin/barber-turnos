import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO } from "@/lib/constants";
import { evaluarPagoTurno } from "@/lib/mercadopago/evaluar-pago-turno";
import { enviarEmailsTurnoConfirmado } from "@/lib/email/enviar-emails-turno-confirmado";
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
  paymentId?: string | number;
  tipoPago?: string;
}): Promise<ResultadoConfirmacionPago> {
  const turno = await prisma.turno.findUnique({
    where: { id: args.turnoId },
    select: {
      id: true,
      userId: true,
      estado: true,
      tipoPago: true,
      precioCongelado: true,
      seniaCongelada: true,
      barberoId: true,
      horarioReservado: true,
      claveSlot: true,
      mpPaymentId: true,
    },
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
    if (args.paymentId && turno.mpPaymentId !== String(args.paymentId)) {
      return { ok: false, error: "El pago no coincide con el turno confirmado" };
    }
    return { ok: true, yaConfirmado: true, turnoId: turno.id };
  }

  const claveSlot = `${turno.barberoId}|${turno.horarioReservado.toISOString()}`;
  if (turno.claveSlot !== claveSlot) {
    return { ok: false, error: "El turno ya no tiene un horario reservado" };
  }

  const resultado = await prisma.turno.updateMany({
    where: { id: turno.id, estado: ESTADOS_TURNO[0], claveSlot },
    data: {
      estado: ESTADOS_TURNO[1],
      estadoPago: validacion.nuevoEstadoPago,
      tipoPago: validacion.tipoPagoGuardar,
      ...(args.paymentId ? { mpPaymentId: String(args.paymentId) } : {}),
    },
  });
  if (resultado.count === 0) {
    const turnoActual = await prisma.turno.findUnique({
      where: { id: turno.id },
      select: { estado: true, mpPaymentId: true },
    });
    if ((turnoActual?.estado === ESTADOS_TURNO[1] || turnoActual?.estado === ESTADOS_TURNO[2]) &&
      (!args.paymentId || turnoActual.mpPaymentId === String(args.paymentId))) {
      return { ok: true, yaConfirmado: true, turnoId: turno.id };
    }
    return { ok: false, error: "El turno ya no admite pagos" };
  }

  revalidarCacheTurno(turno.barberoId, obtenerFechaSola(turno.horarioReservado), turno.userId);

  const turnoConfirmado = await prisma.turno.findUnique({
    where: { id: turno.id },
    include: INCLUDE_TURNO_CON_DETALLE,
  });
  if (turnoConfirmado) enviarEmailsTurnoConfirmado(turnoConfirmado);

  return { ok: true, turnoId: turno.id };
}
