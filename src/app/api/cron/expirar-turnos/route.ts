// src/app/api/cron/expirar-turnos/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Permitir únicamente requests del Cron de Vercel en producción,
  // o llamadas autenticadas con el header x-cron-secret
  if (process.env.NODE_ENV === "production") {
    const esCronVercel = req.headers.get("x-vercel-cron") === "1";
    const secretoValido =
      !!process.env.CRON_SECRET &&
      req.headers.get("x-cron-secret") === process.env.CRON_SECRET;

    if (!esCronVercel && !secretoValido) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
  }

  try {
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
  } catch (error: any) {
    console.error("[CRON] Error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno al expirar turnos",
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}