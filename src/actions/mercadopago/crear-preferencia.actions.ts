"use server";

import { prisma } from "@/lib/prisma";
import { Preference } from "mercadopago";
import { obtenerClienteMP } from "@/lib/mercadopago/obtener-cliente";
import { obtenerConfiguracionMP } from "@/lib/mercadopago/obtener-config";
import { obtenerUrlCheckout } from "@/lib/mercadopago/url-checkout";
import { construirPreferenciaPago } from "@/lib/mercadopago/construir-preferencia-pago";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import { ESTADOS_TURNO, ESTADOS_PAGO, TIPOS_PAGO } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type { DatosPreferenciaPago, TipoPago } from "@/types/mercadopago";

/** Crea la preferencia de pago en Mercado Pago para la seña o el total de un turno. */
export async function crearPreferenciaPago(
  turnoId: string,
  tipoPago: TipoPago,
): Promise<ActionState<DatosPreferenciaPago>> {
  try {
    if (!turnoId || !tipoPago) return { success: false, error: "Datos de pago inválidos" };

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        user: { select: { name: true, email: true } },
        servicio: { select: { nombre: true, descripcion: true } },
        barbero: { select: { nombre: true } },
      },
    });
    if (!turno) return { success: false, error: "Turno no encontrado" };

    // Solo el dueño del turno (o un admin) puede generar su preferencia de pago
    const sesionAutorizada = await requerirPropietarioOAdmin(turno.userId);
    if (!sesionAutorizada) return { success: false, error: "No autorizado" };

    if (turno.estadoPago !== ESTADOS_PAGO[0]) return { success: false, error: "Este turno ya no admite más pagos" };
    if (turno.estado === ESTADOS_TURNO[1]) return { success: false, error: "Este turno ya fue pagado" };
    if (turno.estado === ESTADOS_TURNO[3]) return { success: false, error: "Este turno está cancelado" };

    const esTotal = tipoPago === TIPOS_PAGO[1];
    const monto = esTotal ? Number(turno.precioCongelado) : Number(turno.seniaCongelada);
    if (monto <= 0) {
      return {
        success: false,
        error: esTotal ? "No se pudo calcular el monto total del turno" : "Este servicio no requiere seña",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const isProduction = process.env.NODE_ENV === "production";
    const mp = await obtenerClienteMP();
    const preference = new Preference(mp);

    const body = construirPreferenciaPago(turno, tipoPago, monto, baseUrl, isProduction);
    const response = await preference.create({ body });
    if (!response.id) return { success: false, error: "No se pudo crear la preferencia de pago" };

    // Guardar el preference ID y el tipo de pago en el turno para tracking
    await prisma.turno.update({
      where: { id: turnoId },
      data: { mpPreferenceId: response.id, tipoPago },
    });

    const configuracion = await obtenerConfiguracionMP();
    const checkout = obtenerUrlCheckout(response, configuracion?.accessToken ?? "");

    return {
      success: true,
      data: {
        preferenceId: response.id,
        checkoutUrl: checkout.url,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
        tipoPago,
        montoSolicitado: monto,
      },
    };
  } catch (error) {
    console.error("Error creando preferencia de pago:", error instanceof Error ? error.message : String(error));
    return { success: false, error: "No se pudo procesar el pago. Intentalo de nuevo." };
  }
}
