// src/app/api/cron/expirar-turnos/route.ts

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Permitir únicamente requests del Cron de Vercel en producción,
  // o llamadas autenticadas con el header x-cron-secret
  if (process.env.NODE_ENV === "production") {
    const esCronVercel = req.headers.get("x-vercel-cron") === "1";

    // CRON_SECRET debe setearse como environment variable en Vercel.
    // La comparación usa timingSafeEqual para evitar ataques de timing;
    // solo es seguro cuando ambas longitudes coinciden (si difieren → false).
    let secretoValido = false;
    if (process.env.CRON_SECRET) {
      const bufferConfigurado = Buffer.from(process.env.CRON_SECRET);
      const bufferRecibido = Buffer.from(req.headers.get("x-cron-secret") ?? "");
      try {
        if (bufferConfigurado.length === bufferRecibido.length) {
          secretoValido = crypto.timingSafeEqual(
            bufferConfigurado,
            bufferRecibido
          );
        }
      } catch {
        secretoValido = false;
      }
    }

    if (!esCronVercel && !secretoValido) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
  }

  try {
    // Limpiar locks de slots expirados
    await prisma.slotLock.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Límite: turnos creados hace más de 5 minutos
    const limite = new Date(Date.now() - 5 * 60 * 1000);

    // Buscar turnos pendientes sin pago
    const turnosPendientes = await prisma.turno.findMany({
      where: {
        estado: "PENDIENTE",
        createdAt: {
          lte: limite,
        },
        seniaCongelada: {
          gt: 0,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    // Si no hay turnos para cancelar
    if (turnosPendientes.length === 0) {
      return NextResponse.json({
        ok: true,
        mensaje: "No hay turnos para expirar",
        expirados: 0,
        ejecutadoEn: new Date().toISOString(),
      });
    }

    // Cancelar todos los pendientes vencidos
    const resultado = await prisma.turno.updateMany({
      where: {
        id: {
          in: turnosPendientes.map((t) => t.id),
        },
      },
      data: {
        estado: "CANCELADO",
      },
    });

    console.log(
      `[CRON] Turnos cancelados automáticamente: ${resultado.count}`
    );

    return NextResponse.json({
      ok: true,
      mensaje: `Se cancelaron ${resultado.count} turno(s) pendientes`,
      expirados: resultado.count,
      turnos: turnosPendientes.map((t) => ({
        id: t.id,
        creadoEn: t.createdAt,
      })),
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