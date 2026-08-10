// app/api/mercadopago/webhook/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Payment } from "mercadopago";
import { obtenerClienteMP } from "@/lib/mercadopago";

export const runtime = "nodejs";

/**
 * Verifica la firma X-Signature que envía Mercado Pago.
 * Manifiesto: id:{paymentId};request-id:{x-request-id};ts:{ts};
 * Firma: HMAC-SHA256 del manifiesto con MP_WEBHOOK_SECRET.
 * Si MP_WEBHOOK_SECRET no está configurado, no se puede verificar la firma:
 * devuelve true y se sigue confiando en la validación de monto contra la API.
 */
function firmaValida(req: NextRequest, paymentId: string): boolean {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
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

  const requestId = req.headers.get("x-request-id") ?? "";
  const manifiesto = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const esperado = crypto
    .createHmac("sha256", secreto)
    .update(manifiesto)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(esperado),
      Buffer.from(v1)
    );
  } catch {
    return false;
  }
}

// Mercado Pago envía las notificaciones como POST
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 Webhook MP recibido:", JSON.stringify(body, null, 2));

    // MP puede enviar dos tipos de notificaciones:
    // 1. IPN clásica: { id, topic }
    // 2. Webhooks modernos: { type, data: { id } }
    const paymentId =
      body?.data?.id ||      // webhook moderno
      (body?.topic === "payment" ? body?.id : null); // IPN clásica

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
        // Validar que el monto acreditado cubra la seña congelada del turno
        const montoAcreditado = Number(paymentData.transaction_amount ?? 0);
        if (montoAcreditado < Number(turno.seniaCongelada)) {
          console.error(
            `❌ Monto insuficiente para turno ${turnoId}: acreditado ${montoAcreditado}, seña ${turno.seniaCongelada}`
          );
          return NextResponse.json(
            { error: "Monto no coincide con la seña" },
            { status: 400 }
          );
        }

        if (turno.estado === "PENDIENTE") {
          // Pago aprobado → confirmar el turno
          await prisma.turno.update({
            where: { id: turnoId },
            data: {
              estado: "CONFIRMADO",
              ...(paymentData.id ? { mpPaymentId: String(paymentData.id) } as any : {}),
            },
          });
          console.log(`✅ Turno ${turnoId} CONFIRMADO por pago ${paymentData.id}`);
        } else {
          console.log(`ℹ️ Turno ${turnoId} ya no está PENDIENTE: ${turno.estado}`);
        }
        break;
      }

      case "pending":
      case "in_process": {
        // Pago pendiente → turno sigue PENDIENTE, guardar el paymentId si el campo existe
        try {
          await (prisma.turno as any).update({
            where: { id: turnoId },
            data: { mpPaymentId: String(paymentData.id) },
          });
        } catch { /* campo aún no migrado */ }
        console.log(`⏳ Pago ${paymentData.id} pendiente para turno ${turnoId}`);
        break;
      }

      case "rejected":
      case "cancelled": {
        // Pago rechazado/cancelado → turno vuelve a PENDIENTE sin paymentId confirmado
        await prisma.turno.update({
          where: { id: turnoId },
          data: { estado: "PENDIENTE" },
        });
        console.log(`❌ Pago rechazado/cancelado para turno ${turnoId}`);
        break;
      }

      case "refunded":
      case "charged_back": {
        // Devolución → cancelar el turno
        await prisma.turno.update({
          where: { id: turnoId },
          data: { estado: "CANCELADO" },
        });
        console.log(`↩️ Turno ${turnoId} CANCELADO por devolución/contracargo`);
        break;
      }

      default:
        console.log(`ℹ️ Estado de pago no manejado: ${paymentData.status}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error en webhook MP:", error);
    // Siempre retornar 200 para que MP no reintente indefinidamente
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// MP también puede enviar GET para validar la URL
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: "MP Webhook activo" }, { status: 200 });
}