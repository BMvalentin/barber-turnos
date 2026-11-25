import { ESTADOS_PAGO_ACREDITADOS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";

export async function consultarPagoRetorno(turnoId: string, paymentId?: string) {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    select: {
      userId: true,
      estado: true,
      estadoPago: true,
      tipoPago: true,
      metodoPago: true,
      mpPaymentId: true,
      precioCongelado: true,
      seniaCongelada: true,
      horarioReservado: true,
      user: { select: { name: true } },
      servicio: { select: { nombre: true } },
      barbero: { select: { nombre: true } },
    },
  });

  if (!turno || !(await requerirPropietarioOAdmin(turno.userId))) return null;

  if (turno.metodoPago !== "MERCADO_PAGO" || !turno.mpPaymentId ||
      (paymentId && turno.mpPaymentId !== paymentId)) {
    return { tipo: "revision" } as const;
  }

  if ((turno.estado === "CONFIRMADO" || turno.estado === "COMPLETADO") &&
      ESTADOS_PAGO_ACREDITADOS.some((estado) => estado === turno.estadoPago)) {
    return { tipo: "confirmado", datos: { ...turno, mpPaymentId: turno.mpPaymentId } } as const;
  }
  if (turno.estadoPago === "EN_ACREDITACION") return { tipo: "pendiente" } as const;
  if (turno.estadoPago === "RECHAZADO" || turno.estadoPago === "CANCELADO") {
    return { tipo: "fallido" } as const;
  }
  return { tipo: "revision" } as const;
}
