// app/api/mercadopago/webhook/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Payment } from "mercadopago";
import { obtenerClienteMP } from "@/lib/mercadopago/obtener-cliente";
import { confirmarTurnoPorPago } from "@/lib/confirmar-turno-por-pago";
import { ESTADOS_TURNO } from "@/lib/constants";

export const runtime = "nodejs";

/**
 * Verifica la firma X-Signature que envía Mercado Pago.
 * Manifiesto: id:{paymentId};request-id:{x-request-id};ts:{ts};
 * Firma: HMAC-SHA256 del manifiesto con MP_WEBHOOK_SECRET.
 * MP_WEBHOOK_SECRET debe setearse como environment variable en Vercel.
 * Si no está configurado en producción, se falla CERRADO (false).
 * En desarrollo se advierte con console.warn y se acepta (fail-open)
 * para que el flujo local siga funcionando.
 */
function firmaValida(req: NextRequest, paymentId: string): boolean {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "❌ MP_WEBHOOK_SECRET no configurado: se rechazó la firma del webhook (fail-closed)."
      );
      return false;
    }
    console.warn(
      "⚠️ MP_WEBHOOK_SECRET no configurado: no se verificó la firma del webhook."
    );
    return true;
  }

  const firma = req.headers.get("x-signature") ?? "";
  if (!firma) return false;

  const partes = new Map<string, string>();
  for (const seccion of firma.split(",")) {
    const [clave, valor] = seccion.trim().split("=");
    if (clave && valor) partes.set(clave.trim(), valor.trim());
  }

  const ts = partes.get("ts") ?? "";
  const v1 = partes.get("v1") ?? "";
  if (!ts || !v1) return false;

  // Protección contra replay: rechazar timestamps fuera de una ventana de 5 minutos.
  // Un ts inválido produce NaN, y NaN no supera ningún límite, por eso se
  // rechaza explícitamente con Number.isNaN antes de comparar el skew.
  const tsMs = Number(ts) * 1000;
  const skewMs = Math.abs(Date.now() - tsMs);
  if (Number.isNaN(tsMs) || skewMs > 5 * 60 * 1000) {
    console.error(
      "❌ Firma del webhook con timestamp inválido o fuera de la ventana permitida."
    );
    return false;
  }

  const requestId = req.headers.get("x-request-id") ?? "";
  const manifiesto = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const esperado = crypto
    .createHmac("sha256", secreto)
    .update(manifiesto)
    .digest("hex");

  const bufferEsperado = Buffer.from(esperado);
  const bufferRecibido = Buffer.from(v1);

  try {
    // timingSafeEqual solo es seguro si ambas longitudes coinciden:
    // comparar buffers de distinta longitud lanza excepción (la atrapa el catch)
    // o compara datos no comparables, por eso se rechaza antes de comparar.
    if (bufferEsperado.length !== bufferRecibido.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufferEsperado, bufferRecibido);
  } catch {
    return false;
  }
}

// Mercado Pago envía las notificaciones como POST
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP puede enviar dos tipos de notificaciones:
    // 1. IPN clásica: { id, topic }
    // 2. Webhooks modernos: { type, data: { id } }
    const paymentId =
      body?.data?.id ||      // webhook moderno
      (body?.topic === "payment" ? body?.id : null); // IPN clásica

    console.log("Webhook MP recibido. paymentId:", paymentId);

    if (!paymentId) {
      // Puede ser una notificación de otro tipo (merchant_order, etc.)
      console.log("ℹ️ Webhook sin paymentId, tipo:", body?.type || body?.topic);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Rechazar notificaciones con firma inválida
    if (!firmaValida(req, String(paymentId))) {
      console.error("❌ Firma inválida en webhook para paymentId:", paymentId);
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    // Consultar los detalles del pago a la API de MP
    const mp = await obtenerClienteMP();
    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: paymentId });

    console.log("💳 Datos del pago:", {
      id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference,
      amount: paymentData.transaction_amount,
    });

    const turnoId = paymentData.external_reference;

    if (!turnoId) {
      console.error("❌ Pago sin external_reference (turnoId)");
      return NextResponse.json({ error: "No turnoId" }, { status: 400 });
    }

    const turno = await prisma.turno.findUnique({
      where: { id: String(turnoId) },
      select: { id: true, estado: true, seniaCongelada: true },
    });

    if (!turno) {
      console.error("❌ Turno inexistente para webhook:", turnoId);
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 400 });
    }

    // Manejar los distintos estados de pago
    switch (paymentData.status) {
      case "approved": {
        // Validar el pago contra la API de MP a través del helper compartido
        const montoAcreditado = Number(paymentData.transaction_amount ?? 0);
        const resultado = await confirmarTurnoPorPago({
          turnoId,
          estadoPago: "approved",
          referencia: String(paymentData.external_reference ?? ""),
          montoPago: montoAcreditado,
          paymentId: paymentData.id,
          soloSiPendiente: true,
        });

        if (resultado.ok && !resultado.yaConfirmado) {
          console.log(`✅ Turno ${turnoId} CONFIRMADO por pago ${paymentData.id}`);
        } else if (resultado.yaConfirmado) {
          console.log(`ℹ️ Turno ${turnoId} ya no está PENDIENTE: ${turno.estado}`);
        } else if (resultado.error === "El monto del pago no es válido") {
          console.error(
            `❌ Monto insuficiente para turno ${turnoId}: acreditado ${montoAcreditado}, seña ${turno.seniaCongelada}`
          );
          return NextResponse.json(
            { error: "Monto no coincide con la seña" },
            { status: 400 }
          );
        } else {
          console.error(`❌ No se pudo confirmar el turno ${turnoId}: ${resultado.error}`);
          return NextResponse.json({ error: "No se pudo confirmar el pago" }, { status: 400 });
        }
        break;
      }

      case "pending":
      case "in_process": {
        // Pago pendiente → turno sigue PENDIENTE, guardar el paymentId
        await prisma.turno.update({
          where: { id: turnoId },
          data: { mpPaymentId: String(paymentData.id) },
        });
        console.log(`⏳ Pago ${paymentData.id} pendiente para turno ${turnoId}`);
        break;
      }

      case "rejected":
      case "cancelled": {
        // Pago rechazado/cancelado → turno vuelve a PENDIENTE sin paymentId confirmado
        await prisma.turno.update({
          where: { id: turnoId },
          data: { estado: ESTADOS_TURNO[0] },
        });
        console.log(`❌ Pago rechazado/cancelado para turno ${turnoId}`);
        break;
      }

      case "refunded":
      case "charged_back": {
        // Devolución → cancelar el turno
        await prisma.turno.update({
          where: { id: turnoId },
          data: { estado: ESTADOS_TURNO[3] },
        });
        console.log(`↩️ Turno ${turnoId} CANCELADO por devolución/contracargo`);
        break;
      }

      default:
        console.log(`ℹ️ Estado de pago no manejado: ${paymentData.status}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en webhook MP:", error instanceof Error ? error.message : String(error));
    // Siempre retornar 200 para que MP no reintente indefinidamente
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// MP también puede enviar GET para validar la URL
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: "MP Webhook activo" }, { status: 200 });
}