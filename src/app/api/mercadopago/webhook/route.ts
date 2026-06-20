import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Payment } from "mercadopago";
import { obtenerClienteMP } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    // 1. Obtener el body de la petición que envía Mercado Pago
    const body = await req.json();

    // Mercado Pago puede enviar eventos con formato `type: "payment"` o `action: "payment.created"`
    const isPaymentEvent = 
      body.type === "payment" || 
      body.topic === "payment" || 
      body.action?.startsWith("payment.");

    const paymentId = body.data?.id;

    // Si no es un evento de pago o no tiene ID, devolvemos 200 OK para que MP no reintente.
    if (!isPaymentEvent || !paymentId) {
      return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
    }

    // 2. Obtener el Access Token del negocio desde la base de datos
    const config = await prisma.configuracion.findUnique({
      where: { id: "global" },
    });

    if (!config || !config.mpAccessToken) {
      console.error("❌ Webhook: El negocio no tiene configurado un Access Token de Mercado Pago.");
      // Devolvemos 200 para que MP no siga intentando enviar notificaciones a un sistema sin token
      return NextResponse.json({ message: "Falta token de configuración" }, { status: 200 });
    }

    // 3. Inicializar Mercado Pago con el token dinámico
    const mp = await obtenerClienteMP();

    const paymentClient = new Payment(mp);

    // 4. Consultar el estado REAL del pago en la API de Mercado Pago
    // Esto evita fraudes (alguien podría mandar un POST falso a tu webhook)
    const paymentData = await paymentClient.get({ id: paymentId });

    // 5. Verificar si el pago fue aprobado
    if (paymentData.status === "approved") {
      // El external_reference es el turnoId que le pasamos al crear la preferencia
      const turnoId = paymentData.external_reference;

      if (turnoId) {
        // Verificar el estado actual del turno antes de actualizar
        const turno = await prisma.turno.findUnique({
          where: { id: turnoId },
          select: { estado: true }
        });

        if (turno && turno.estado !== "CONFIRMADO") {
          // 6. Actualizar el estado del turno y guardar el comprobante
          await prisma.turno.update({
            where: { id: turnoId },
            data: {
              estado: "CONFIRMADO",
              mpPaymentId: String(paymentId),
            },
          });
          
          console.log(`✅ Webhook: Turno ${turnoId} confirmado exitosamente (Pago: ${paymentId})`);
        } else {
          console.log(`ℹ️ Webhook: Turno ${turnoId} ya estaba confirmado o no existe.`);
        }
      }
    }

    // 7. Siempre responder con status 200 a Mercado Pago para confirmar la recepción
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error en Webhook de Mercado Pago:", error);
    
    // Si hay un error de conexión a la BD, podemos devolver 500 para que MP reintente más tarde
    return NextResponse.json(
      { error: "Error procesando el webhook" }, 
      { status: 500 }
    );
  }
}