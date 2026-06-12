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
// ======================================================
export async function crearPreferenciaPago(
  turnoId: string
): Promise<ActionState> {
  try {
    if (!turnoId) {
      return {
        success: false,
        error: "ID de turno inválido",
      };
    }

    const config = await prisma.configuracion.findUnique({
      where: { id: "global" },
    });

    if (!config?.mpAccessToken) {
      return {
        success: false,
        error:
          "El negocio aún no configuró su cuenta de Mercado Pago para recibir pagos.",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      return {
        success: false,
        error:
          "NEXT_PUBLIC_APP_URL no está configurada correctamente.",
      };
    }

    const isProduction =
      process.env.IS_PRODUCTION === "true";

    console.log("================================");
    console.log("MP CONFIG");
    console.log("APP_URL:", baseUrl);
    console.log("IS_PRODUCTION:", isProduction);
    console.log("================================");

    const mp = new MercadoPagoConfig({
      accessToken: config.mpAccessToken,
      options: {
        timeout: 5000,
      },
    });

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        servicio: {
          select: {
            nombre: true,
            descripcion: true,
          },
        },
        barbero: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!turno) {
      return {
        success: false,
        error: "Turno no encontrado",
      };
    }

    if (turno.estado === "CONFIRMADO") {
      return {
        success: false,
        error: "Este turno ya fue pagado",
      };
    }

    if (turno.estado === "CANCELADO") {
      return {
        success: false,
        error: "Este turno está cancelado",
      };
    }

    const seniaAmount = Number(turno.seniaCongelada);

    if (seniaAmount <= 0) {
      return {
        success: false,
        error: "Este servicio no requiere seña",
      };
    }

    const fechaTurno = new Date(
      turno.horarioReservado
    );

    const fechaFormateada =
      `${fechaTurno
        .getDate()
        .toString()
        .padStart(2, "0")}/` +
      `${(fechaTurno.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/` +
      `${fechaTurno.getFullYear()} ` +
      `${fechaTurno
        .getHours()
        .toString()
        .padStart(2, "0")}:` +
      `${fechaTurno
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

    const tituloItem = `Seña - ${turno.servicio.nombre}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const preference = new Preference(mp);

    const body: any = {
      items: [
        {
          id: turnoId,
          title: tituloItem,
          description: `Turno con ${turno.barbero.nombre} | ${fechaFormateada}`,
          quantity: 1,
          unit_price: seniaAmount,
          currency_id: "ARS",
        },
      ],

      payer: {
        name: turno.user.name ?? "Cliente",
        email:
          turno.user.email ??
          "cliente@email.com",
      },

      back_urls: {
        success: `${baseUrl}/pago/status?turnoId=${turnoId}`,
        failure: `${baseUrl}/pago/status?turnoId=${turnoId}`,
        pending: `${baseUrl}/pago/status?turnoId=${turnoId}`,
      },

      notification_url:
        `${baseUrl}/api/mercadopago/webhook`,

      external_reference: turnoId,
    };

    if (isProduction) {
      body.auto_return = "approved";

      body.expires = true;
      body.expiration_date_from =
        new Date().toISOString();

      body.expiration_date_to = new Date(
        Date.now() + 5 * 60 * 1000
      ).toISOString();
    }

    console.log("🔔 CREANDO PREFERENCIA");
    console.log(
      JSON.stringify(body, null, 2)
    );

    const response = await preference.create({
      body,
    });

    console.log("✅ PREFERENCIA CREADA");
    console.log({
      id: response.id,
      collector_id: response.collector_id,
      init_point: response.init_point,
      sandbox_init_point:
        response.sandbox_init_point,
    });

    if (!response.id) {
      return {
        success: false,
        error:
          "No se pudo crear la preferencia de pago",
      };
    }

    await prisma.turno.update({
      where: {
        id: turnoId,
      },
      data: {
        mpPreferenceId: response.id,
      } as any,
    });

    const checkoutUrl =
      !isProduction &&
      response.sandbox_init_point
        ? response.sandbox_init_point
        : response.init_point;

    return {
      success: true,
      data: {
        preferenceId: response.id,
        checkoutUrl,
        initPoint: response.init_point,
        sandboxInitPoint:
          response.sandbox_init_point,
      },
    };
  } catch (error: any) {
    console.error(
      "❌ Error creando preferencia MP:",
      error
    );

    return {
      success: false,
      error:
        error?.message ??
        "Error al crear el pago",
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

    if (turno.estado === "CONFIRMADO") {
      return { success: true, data: turno };
    }

    const config = await prisma.configuracion.findUnique({
      where: { id: "global" },
    });

    if (!config || !config.mpAccessToken) {
      return { success: false, error: "Falta token de Mercado Pago" };
    }

    const mp = new MercadoPagoConfig({
      accessToken: config.mpAccessToken,
      options: { timeout: 5000 },
    });

    const paymentClient = new Payment(mp);
    const paymentData = await paymentClient.get({ id: paymentId });

    if (paymentData.status === "approved") {
      const turnoActualizado = await prisma.turno.update({
        where: { id: turnoId },
        data: {
          estado: "CONFIRMADO",
          mpPaymentId: paymentId,
        } as any,
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