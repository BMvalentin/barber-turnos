// app/api/mercadopago/webhook/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Payment } from "mercadopago";
import { obtenerClienteMP } from "@/lib/mercadopago/obtener-cliente";
import { confirmarTurnoPorPago } from "@/lib/confirmar-turno-por-pago";
import { ESTADOS_TURNO, ESTADOS_PAGO } from "@/lib/constants";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { z } from "zod";

export const runtime = "nodejs";

const esquemaIdPago = z.union([z.string().regex(/^\d+$/), z.number().int().positive()]);
const esquemaNotificacion = z.object({
  type: z.string().optional(),
  topic: z.string().optional(),
  data: z.object({ id: esquemaIdPago }).optional(),
  id: esquemaIdPago.optional(),
});

/**
 * Verifica la firma X-Signature que envía Mercado Pago.
 * Manifiesto: id:{paymentId};request-id:{x-request-id};ts:{ts};
 * Firma: HMAC-SHA256 del manifiesto con MP_WEBHOOK_SECRET.
 * MP_WEBHOOK_SECRET debe setearse como environment variable en Vercel.
 * Sin secreto configurado, la notificación se rechaza.
 */
function firmaValida(req: NextRequest, paymentId: string): boolean {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    return false;
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
    const cuerpo: unknown = await req.json();
    const notificacion = esquemaNotificacion.safeParse(cuerpo);
    if (!notificacion.success) {
      return NextResponse.json({ error: "Notificación inválida" }, { status: 400 });
    }
    const body = notificacion.data;

    // MP puede enviar dos tipos de notificaciones:
    // 1. IPN clásica: { id, topic }
    // 2. Webhooks modernos: { type, data: { id } }
    const paymentId = body.type === "payment"
      ? body.data?.id
      : body.topic === "payment" ? body.id : undefined;

    if (!paymentId) {
      if (body.type === "payment" || body.topic === "payment") {
        return NextResponse.json({ error: "ID de pago faltante" }, { status: 400 });
      }
      // Puede ser una notificación de otro tipo (merchant_order, etc.)
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Rechazar notificaciones con firma inválida
    if (!firmaValida(req, String(paymentId))) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    // Consultar los detalles del pago a la API de MP
    const mp = await obtenerClienteMP();
    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: paymentId });
    const idPago = paymentData.id == null ? "" : String(paymentData.id);
    if (!idPago || idPago !== String(paymentId)) {
      return NextResponse.json({ error: "Pago inválido" }, { status: 400 });
    }

    const turnoId = paymentData.external_reference;

    if (!turnoId) {
      return NextResponse.json({ error: "No turnoId" }, { status: 400 });
    }

    const turno = await prisma.turno.findUnique({
      where: { id: String(turnoId) },
      select: { id: true, userId: true, barberoId: true, horarioReservado: true },
    });

    if (!turno) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 400 });
    }

    // Manejar los distintos estados de pago
    switch (paymentData.status) {
      case "approved": {
        // Validar el pago contra la API de MP a través del helper compartido
        const montoAcreditado = Number(paymentData.transaction_amount ?? 0);
        const tipoPago =
          typeof paymentData.metadata?.tipoPago === "string" ? paymentData.metadata.tipoPago : undefined;
        const resultado = await confirmarTurnoPorPago({
          turnoId,
          estadoPago: "approved",
          referencia: String(paymentData.external_reference ?? ""),
          montoPago: montoAcreditado,
          paymentId: idPago,
          tipoPago,
        });

        if (!resultado.ok) {
          const mensaje = resultado.error === "El monto del pago no es válido"
            ? "Monto no coincide con la seña/total"
            : "No se pudo confirmar el pago";
          return NextResponse.json({ error: mensaje }, { status: 400 });
        }
        if (!resultado.yaConfirmado) {
          revalidatePath("/turno");
          revalidatePath("/admin");
          revalidatePath("/dashboard");
        }
        break;
      }

      case "pending":
      case "in_process": {
        // Pago en acreditación → turno sigue PENDIENTE, guarda el paymentId y el estado
        await prisma.turno.updateMany({
          where: {
            id: turnoId,
            estado: ESTADOS_TURNO[0],
            OR: [{ mpPaymentId: null }, { mpPaymentId: idPago }],
          },
          data: { mpPaymentId: idPago, estadoPago: ESTADOS_PAGO[6] },
        });
        break;
      }

      case "rejected": {
        // Pago rechazado → la reserva sigue disponible para reintentar el pago.
        await prisma.turno.updateMany({
          where: { id: turnoId, estado: ESTADOS_TURNO[0], mpPaymentId: idPago },
          data: { estadoPago: ESTADOS_PAGO[4] },
        });
        break;
      }

      case "cancelled": {
        // Un pago cancelado antes de confirmar no debe ocultar la reserva ni
        // impedir que el cliente elija otro medio de pago.
        await prisma.turno.updateMany({
          where: { id: turnoId, estado: ESTADOS_TURNO[0], mpPaymentId: idPago },
          data: { estadoPago: ESTADOS_PAGO[5] },
        });
        break;
      }

      case "refunded":
      case "charged_back": {
        // Devolución → cancelar el turno y el estado de pago
        const resultado = await prisma.turno.updateMany({
          where: {
            id: turnoId,
            mpPaymentId: idPago,
            estado: { in: [ESTADOS_TURNO[1], ESTADOS_TURNO[2]] },
          },
          data: { estado: ESTADOS_TURNO[3], estadoPago: ESTADOS_PAGO[5], claveSlot: null },
        });
        if (resultado.count > 0) {
          revalidarCacheTurno(
            turno.barberoId,
            obtenerFechaSola(turno.horarioReservado),
            turno.userId,
          );
          revalidatePath("/dashboard");
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error al procesar webhook de Mercado Pago:", error instanceof Error ? error.name : "Error desconocido");
    return NextResponse.json({ error: "No se pudo procesar la notificación" }, { status: 500 });
  }
}

// MP también puede enviar GET para validar la URL
export async function GET() {
  return NextResponse.json({ status: "MP Webhook activo" }, { status: 200 });
}
