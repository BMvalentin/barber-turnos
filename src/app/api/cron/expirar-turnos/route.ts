// src/app/api/cron/expirar-turnos/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Permitir únicamente requests del Cron de Vercel en producción
  if (
    process.env.NODE_ENV === "production" &&
    req.headers.get("x-vercel-cron") !== "1"
  ) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
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
        seniaCongelada: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
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
        usuario: t.user.email,
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