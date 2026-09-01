import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO } from "@/lib/constants";
import { evaluarPagoTurno } from "@/lib/mercadopago/evaluar-pago-turno";
import { enviarEmailsTurnoConfirmado } from "@/lib/email/enviar-emails-turno-confirmado";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";

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
 * `estado = PENDIENTE`. Si la fila no matchea (`count === 0`), el turno ya fue
 * confirmado por otra petición y se devuelve `yaConfirmado` sin duplicar emails
 * ni acciones (protege de reintentos del webhook).
 */
export async function confirmarTurnoPorPago(args: {
  turnoId: string;
  estadoPago: string;
  referencia: string;
  montoPago: number;
  paymentId?: string | number;
  tipoPago?: string;
  soloSiPendiente?: boolean;
}): Promise<ResultadoConfirmacionPago> {
  const turno = await prisma.turno.findUnique({
    where: { id: args.turnoId },
    select: { id: true, estado: true, tipoPago: true, precioCongelado: true, seniaCongelada: true },
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
    soloSiPendiente: args.soloSiPendiente,
  });

  if (!validacion.ok) return { ok: false, error: validacion.error };
  if (validacion.yaConfirmado) return { ok: true, yaConfirmado: true, turnoId: turno.id };

  const resultado = await prisma.turno.updateMany({
    where: { id: turno.id, estado: ESTADOS_TURNO[0] },
    data: {
      estado: ESTADOS_TURNO[1],
      estadoPago: validacion.nuevoEstadoPago,
      tipoPago: validacion.tipoPagoGuardar,
      ...(args.paymentId ? { mpPaymentId: String(args.paymentId) } : {}),
    },
  });
  if (resultado.count === 0) return { ok: true, yaConfirmado: true, turnoId: turno.id };

  const turnoConfirmado = await prisma.turno.findUnique({
    where: { id: turno.id },
    include: INCLUDE_TURNO_CON_DETALLE,
  });
  if (turnoConfirmado) enviarEmailsTurnoConfirmado(turnoConfirmado);

  return { ok: true, turnoId: turno.id };
}
