// src/app/api/cron/expirar-turnos/route.ts

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ESTADOS_TURNO, ESTADOS_PAGO_EXPIRABLES, EXPIRACION_TURNO_PENDIENTE_MS } from "@/lib/constants";

export const runtime = "nodejs";

function obtenerSecretoRecibido(req: NextRequest): string {
  const autorizacion = req.headers.get("authorization") ?? "";
  if (autorizacion.startsWith("Bearer ")) {
    return autorizacion.slice("Bearer ".length);
  }
  return req.headers.get("x-cron-secret") ?? "";
}

function esSecretoCronValido(req: NextRequest): boolean {
  const secretoConfigurado = process.env.CRON_SECRET;
  if (!secretoConfigurado) return false;

  const esperado = Buffer.from(secretoConfigurado);
  const recibido = Buffer.from(obtenerSecretoRecibido(req));
  return esperado.length === recibido.length && crypto.timingSafeEqual(esperado, recibido);
}

export async function GET(req: NextRequest) {
  if (!esSecretoCronValido(req)) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 },
    );
  }

  try {
    // Limpiar locks de slots expirados
    await prisma.slotLock.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Límite: reservas temporales sin pago creadas hace más de la ventana de expiración.
    // (Se alinea con la vigencia de la preferencia de Mercado Pago.)
    const limite = new Date(Date.now() - EXPIRACION_TURNO_PENDIENTE_MS);

    // Se excluye EN_ACREDITACION: un pago en proceso no debe cancelarse.
    // updateMany evita materializar IDs vencidos y mantiene la operación acotada.
    const resultado = await prisma.turno.updateMany({
      where: {
        estado: ESTADOS_TURNO[0],
        estadoPago: { in: [...ESTADOS_PAGO_EXPIRABLES] },
        createdAt: {
          lte: limite,
        },
      },
      data: {
        estado: ESTADOS_TURNO[3],
      },
    });

    console.log(
      `[CRON] Turnos cancelados automáticamente: ${resultado.count}`
    );

    return NextResponse.json({
      ok: true,
      mensaje: `Se cancelaron ${resultado.count} turno(s) pendientes`,
      expirados: resultado.count,
      ejecutadoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "[CRON] Error:",
      error instanceof Error ? error.message : "Error desconocido"
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno al expirar turnos",
      },
      { status: 500 }
    );
  }
}
