import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO } from "@/lib/constants";
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
 * (pasándolo a CONFIRMADO y guardando mpPaymentId). Lo consumen la server
 * action `confirmarPagoTurno` y el webhook de Mercado Pago para evitar lógica
 * duplicada/divergente. No hace revalidaciones: cada caller decide las suyas.
 *
 * `soloSiPendiente` preserva el comportamiento del webhook original (solo
 * confirmaba turnos PENDIENTES): cuando es `true`, los turnos que ya están en
 * otro estado (COMPLETADO/CANCELADO) se devuelven como `yaConfirmado` sin
 * modificar. La acción `confirmarPagoTurno` lo omite y conserva su
 * comportamiento original de confirmar cualquier turno no CONFIRMADO.
 */
export async function confirmarTurnoPorPago(args: {
  turnoId: string;
  estadoPago: string;
  referencia: string;
  montoPago: number;
  paymentId?: string | number;
  soloSiPendiente?: boolean;
}): Promise<ResultadoConfirmacionPago> {
  const turno = await prisma.turno.findUnique({
    where: { id: args.turnoId },
    select: { id: true, estado: true, seniaCongelada: true },
  });

  if (!turno) {
    return { ok: false, error: "Turno no encontrado" };
  }

  if (args.estadoPago !== "approved") {
    return { ok: false, error: "El pago no está acreditado todavía" };
  }

  if (args.referencia !== args.turnoId) {
    return { ok: false, error: "El pago no corresponde a este turno" };
  }

  if (args.montoPago < Number(turno.seniaCongelada)) {
    return { ok: false, error: "El monto del pago no es válido" };
  }

  if (turno.estado === ESTADOS_TURNO[1]) {
    return { ok: true, yaConfirmado: true, turnoId: turno.id };
  }

  if (args.soloSiPendiente && turno.estado !== ESTADOS_TURNO[0]) {
    return { ok: true, yaConfirmado: true, turnoId: turno.id };
  }

  await prisma.turno.update({
    where: { id: turno.id },
    data: {
      estado: ESTADOS_TURNO[1],
      ...(args.paymentId ? { mpPaymentId: String(args.paymentId) } : {}),
    },
  });

  const turnoConfirmado = await prisma.turno.findUnique({
    where: { id: turno.id },
    include: INCLUDE_TURNO_CON_DETALLE,
  });
  if (turnoConfirmado) {
    enviarEmailsTurnoConfirmado(turnoConfirmado);
  }

  return { ok: true, turnoId: turno.id };
}
