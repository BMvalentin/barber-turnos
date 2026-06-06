"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import MercadoPagoConfig, { Preference, Payment } from "mercadopago";

export type ActionState = {
  success: boolean;
  error?: string;
  data?: any;
};

// ======================================================
// CREATE PREFERENCE
// Crea la preferencia de pago en MP para la seña de un turno
// ======================================================
export async function crearPreferenciaPago(turnoId: string): Promise<ActionState> {
  try {
    if (!turnoId) {
      return { success: false, error: "ID de turno inválido" };
    }

    const config = await prisma.configuracion.findUnique({
      where: { id: "global" },
    });

    if (!config || !config.mpAccessToken) {
      return { 
        success: false, 
        error: "El negocio aún no configuró su cuenta de Mercado Pago para recibir pagos." 
      };
    }

    const mp = new MercadoPagoConfig({
      accessToken: config.mpAccessToken,
      options: { timeout: 5000 },
    });

    // Obtener el turno con toda la info necesaria
    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        user: { select: { name: true, email: true } },
        servicio: { select: { nombre: true, descripcion: true } },
        barbero: { select: { nombre: true } },
      },
    });

    if (!turno) {
      return { success: false, error: "Turno no encontrado" };
    }

    if (turno.estado === "CONFIRMADO") {
      return { success: false, error: "Este turno ya fue pagado" };
    }

    if (turno.estado === "CANCELADO") {
      return { success: false, error: "Este turno está cancelado" };
    }

    const seniaAmount = Number(turno.seniaCongelada);

    if (seniaAmount <= 0) {
      return { success: false, error: "Este servicio no requiere seña" };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const isProduction = process.env.NODE_ENV === "production";
    const preference = new Preference(mp);

    const body = {
      items: [
        {
          id: turnoId,
          title: `Seña - ${turno.servicio.nombre}`,
          description: `Turno con ${turno.barbero.nombre} | ${turno.horarioReservado.toLocaleString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          quantity: 1,
          unit_price: seniaAmount,
          currency_id: "ARS",
        },
      ],
      payer: {
        name: turno.user.name ?? "Cliente",
        email: turno.user.email ?? "cliente@email.com",
      },
      // 1. CAMBIO AQUÍ: Centralizamos las 3 URLs viejas en la nueva ruta única dinámica
      back_urls: {
        success: `${baseUrl}/pago/status?status=success&turnoId=${turnoId}`,
        failure: `${baseUrl}/pago/status?status=failure&turnoId=${turnoId}`,
        pending: `${baseUrl}/pago/status?status=pending&turnoId=${turnoId}`,
      },
      // auto_return solo funciona con URLs públicas (no localhost).
      // En producción lo activamos para redirigir automáticamente al usuario.
      ...(isProduction && { auto_return: "approved" as const }),
      
      // El webhook que va a escuchar los eventos reales en segundo plano
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      external_reference: turnoId,
      
      // Vence en 5 minutos para evitar que el usuario pague una seña vieja
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    const response = await preference.create({ body });

    if (!response.id) {
      return { success: false, error: "No se pudo crear la preferencia de pago" };
    }

    // Guardar el preference ID en el turno para tracking
    try {
      await (prisma.turno as any).update({
        where: { id: turnoId },
        data: { mpPreferenceId: response.id },
      });
    } catch {
      // Campo mpPreferenceId aún no existe en el schema — ignorar
    }

    return {
      success: true,
      data: {
        preferenceId: response.id,
        checkoutUrl: response.init_point,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
      },
    };
  } catch (error: any) {
    console.error("❌ Error creando preferencia MP:", error);
    return {
      success: false,
      error: error?.message ?? "Error al crear el pago",
    };
  }
}

// ======================================================
// CONFIRMAR PAGO MANUAL (Fallback de seguridad)
// ======================================================
export async function confirmarPagoTurno(
  turnoId: string,
  paymentId?: string
): Promise<ActionState> {
  try {
    if (!turnoId || !paymentId) {
      return { success: false, error: "Faltan datos de la transacción" };
    }

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
    });

    if (!turno) {
      return { success: false, error: "Turno no encontrado" };
    }

    // 1. Si el Webhook fue rapidísimo y ya lo confirmó, salimos.
    if (turno.estado === "CONFIRMADO") {
      return { success: true, data: turno };
    }

    // 2. Traer la configuración de MP del negocio
    const config = await prisma.configuracion.findUnique({
      where: { id: "global" },
    });

    if (!config || !config.mpAccessToken) {
      return { success: false, error: "Falta token de Mercado Pago" };
    }

    // 3. Inicializar MP
    const mp = new MercadoPagoConfig({
      accessToken: config.mpAccessToken,
      options: { timeout: 5000 },
    });

    const paymentClient = new Payment(mp);

    // 4. VERIFICACIÓN REAL: Consultar a Mercado Pago el estado de este ID
    const paymentData = await paymentClient.get({ id: paymentId });

    // 5. Solo si Mercado Pago dice que está "approved", actualizamos la BD
    if (paymentData.status === "approved") {
      const turnoActualizado = await prisma.turno.update({
        where: { id: turnoId },
        data: {
          estado: "CONFIRMADO",
          mpPaymentId: paymentId,
        },
      });

      revalidatePath("/dashboard");
      revalidatePath("/turno");
      revalidatePath("/admin");

      return {
        success: true,
        data: {
          ...turnoActualizado,
          precioCongelado: Number(turnoActualizado.precioCongelado),
          seniaCongelada: Number(turnoActualizado.seniaCongelada),
        },
      };
    } else {
      // Si el estado en MP no es approved (ej: pending, rejected), no confirmamos.
      return { 
        success: false, 
        error: `El pago figura como ${paymentData.status} en Mercado Pago` 
      };
    }

  } catch (error: any) {
    console.error("❌ Error verificando pago de manera manual:", error);
    return {
      success: false,
      error: error?.message ?? "Error al verificar el pago",
    };
  }
}

// ======================================================
// VERIFICAR ESTADO DE PAGO (desde el cliente)
// El front-end puede usar esto para polling si fuera necesario
// ======================================================
export async function verificarEstadoPago(turnoId: string): Promise<ActionState> {
  try {
    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: {
        id: true,
        estado: true,
        seniaCongelada: true,
      },
    });

    if (!turno) {
      return { success: false, error: "Turno no encontrado" };
    }

    return {
      success: true,
      data: {
        id: turno.id,
        estado: turno.estado,
        seniaCongelada: Number(turno.seniaCongelada),
        mpPaymentId: (turno as any).mpPaymentId ?? null,
        mpPreferenceId: (turno as any).mpPreferenceId ?? null,
      },
    };
  } catch (error: any) {
    return { success: false, error: "Error al verificar el pago" };
  }
}