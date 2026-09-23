"use server";

import { prisma } from "@/lib/prisma";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import {
  ESTADOS_PAGO,
  ESTADOS_PAGO_REINTENTABLES,
  ESTADOS_TURNO,
  TIPOS_PAGO,
} from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { esTransferenciaConfigurada } from "@/lib/pagos/es-transferencia-configurada";
import type { ActionState } from "@/types/action-state";
import type { TipoPago } from "@/types/mercadopago";

/** Registra una transferencia pendiente de revisión sin acreditar el turno. */
export async function registrarTransferencia(
  turnoId: string,
  tipoPago: TipoPago,
): Promise<ActionState> {
  try {
    if (!turnoId || !TIPOS_PAGO.includes(tipoPago)) {
      return { success: false, error: "Datos de transferencia inválidos" };
    }

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: {
        userId: true,
        estado: true,
        estadoPago: true,
        metodoPago: true,
        precioCongelado: true,
        seniaCongelada: true,
      },
    });
    if (!turno) return { success: false, error: "Turno no encontrado" };

    const sesionAutorizada = await requerirPropietarioOAdmin(turno.userId);
    if (!sesionAutorizada) return { success: false, error: "No autorizado" };
    const configuracion = await obtenerConfigCacheada();
    if (!configuracion || !esTransferenciaConfigurada({
      transferenciaTitular: configuracion.transferenciaTitular || "",
      transferenciaCuit: configuracion.transferenciaCuit || "",
      transferenciaAlias: configuracion.transferenciaAlias || "",
      transferenciaCbu: configuracion.transferenciaCbu || "",
      transferenciaBanco: configuracion.transferenciaBanco || "",
    })) {
      return { success: false, error: "La transferencia no está configurada" };
    }
    if (turno.estado === ESTADOS_TURNO[3]) {
      return { success: false, error: "Este turno está cancelado" };
    }
    if (turno.estado === ESTADOS_TURNO[1]) {
      return { success: false, error: "Este turno ya fue confirmado" };
    }
    const transferenciaEnRevision = turno.estadoPago === ESTADOS_PAGO[6] && turno.metodoPago === "TRANSFERENCIA";
    const pagoReintentable = (ESTADOS_PAGO_REINTENTABLES as readonly string[]).includes(turno.estadoPago);
    if (!pagoReintentable && !transferenciaEnRevision) {
      return { success: false, error: "Este turno ya tiene un pago en proceso o registrado" };
    }
    if (turno.estado !== ESTADOS_TURNO[0]) {
      return { success: false, error: "Este turno ya no está disponible para pagar" };
    }
    const monto = tipoPago === TIPOS_PAGO[1]
      ? Number(turno.precioCongelado)
      : Number(turno.seniaCongelada);
    if (monto <= 0) {
      return { success: false, error: "El monto de la transferencia no es válido" };
    }

    const resultado = await prisma.turno.updateMany({
      where: {
        id: turnoId,
        estado: ESTADOS_TURNO[0],
        estadoPago: { in: [...ESTADOS_PAGO_REINTENTABLES, ESTADOS_PAGO[6]] },
      },
      data: {
        tipoPago,
        metodoPago: "TRANSFERENCIA",
        estadoPago: ESTADOS_PAGO[6],
      },
    });
    if (resultado.count === 0) {
      return { success: false, error: "Este turno ya no admite transferencias" };
    }

    revalidatePath("/turno");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error al registrar transferencia:", error);
    return { success: false, error: "No se pudo registrar la transferencia" };
  }
}
