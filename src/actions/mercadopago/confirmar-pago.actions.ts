"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Payment } from "mercadopago";
import { obtenerClienteMP } from "@/lib/mercadopago/obtener-cliente";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import { confirmarTurnoPorPago } from "@/lib/confirmar-turno-por-pago";
import { ESTADOS_TURNO } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type { TurnoPagoConfirmado } from "@/types/turno";

const incluirRelaciones = {
  user: { select: { name: true } },
  servicio: { select: { nombre: true } },
  barbero: { select: { nombre: true } },
} as const;

/** Confirma el pago de un turno verificando el pago contra la API de Mercado Pago. */
export async function confirmarPagoTurno(
  turnoId: string,
  paymentId?: string,
): Promise<ActionState<TurnoPagoConfirmado>> {
  try {
    if (!turnoId) return { success: false, error: "ID de turno inválido" };

    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "Iniciá sesión para confirmar tu pago" };

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: incluirRelaciones,
    });
    if (!turno) return { success: false, error: "Turno no encontrado" };

    // Solo el dueño del turno (o un admin) puede confirmar su pago
    const sesionAutorizada = await requerirPropietarioOAdmin(turno.userId);
    if (!sesionAutorizada) return { success: false, error: "No autorizado" };

    // Si ya está confirmado (por el webhook), no hacer nada
    if (turno.estado === ESTADOS_TURNO[1]) {
      return {
        success: true,
        data: {
          ...turno,
          precioCongelado: Number(turno.precioCongelado),
          seniaCongelada: Number(turno.seniaCongelada),
        },
      };
    }

    // Sin paymentId no hay forma de verificar el pago: rechazar
    if (!paymentId) return { success: false, error: "No se pudo verificar el pago: falta el ID del pago" };

    // Verificar el pago contra la API de Mercado Pago
    const mp = await obtenerClienteMP();
    const payment = new Payment(mp);
    const datosPago = await payment.get({ id: paymentId });

    const resultado = await confirmarTurnoPorPago({
      turnoId,
      estadoPago: String(datosPago.status ?? ""),
      referencia: String(datosPago.external_reference ?? ""),
      montoPago: Number(datosPago.transaction_amount ?? 0),
      paymentId,
    });

    if (!resultado.ok) return { success: false, error: resultado.error };

    if (!resultado.yaConfirmado) {
      revalidatePath("/dashboard");
      revalidatePath("/turno");
      revalidatePath("/admin");
    }

    const turnoActualizado = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: incluirRelaciones,
    });
    if (!turnoActualizado) return { success: false, error: "Turno no encontrado" };

    return {
      success: true,
      data: {
        ...turnoActualizado,
        precioCongelado: Number(turnoActualizado.precioCongelado),
        seniaCongelada: Number(turnoActualizado.seniaCongelada),
      },
    };
  } catch (error) {
    console.error("Error confirmando pago:", error instanceof Error ? error.message : String(error));
    return { success: false, error: "No se pudo confirmar el pago. Intentalo de nuevo." };
  }
}
