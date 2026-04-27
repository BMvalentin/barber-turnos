// src/app/api/cron/expirar-turnos/route.ts
// Se ejecuta cada 5 minutos para expirar turnos PENDIENTES sin pago
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Clave secreta para proteger el endpoint de accesos no autorizados
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // Verificar la clave secreta del cron (solo en producción)
  if (process.env.NODE_ENV === "production") {
    const authHeader = req.headers.get("authorization");
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
  }

  try {
    // Calcular el límite de tiempo: hace 5 minutos
    const limite = new Date(Date.now() - 1 * 60 * 1000);

    // Buscar todos los turnos PENDIENTES que tengan más de 5 minutos sin pago
    // Se considera el createdAt del turno como punto de partida
    const turnosPendientes = await prisma.turno.findMany({
      where: {
        estado: "CANCELADO", // Solo los que están pendientes de pago
        createdAt: {
          lte: limite, // Creados hace más de 5 minutos
        },
        // Solo expiramos los que tienen seña (requieren pago)
        seniaCongelada: {
          gt: 0,
        },
      },
      select: {
        id: true,
        createdAt: true,
        seniaCongelada: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (turnosPendientes.length === 0) {
      return NextResponse.json({
        ok: true,
        mensaje: "No hay turnos para expirar",
        expirados: 0,
        ejecutadoEn: new Date().toISOString(),
      });
    }

    // Actualizar todos los turnos encontrados a EXPIRADO en una sola operación
    const resultado = await prisma.turno.updateMany({
      where: {
        id: {
          in: turnosPendientes.map((t) => t.id),
        },
      },
      data: {
        estado: "CANCELADO" as any,
      },
    });

    console.log(
      `[CRON] Turnos expirados: ${resultado.count} | ${new Date().toISOString()}`
    );

    return NextResponse.json({
      ok: true,
      mensaje: `Se expiraron ${resultado.count} turno(s) sin pago`,
      expirados: resultado.count,
      turnos: turnosPendientes.map((t) => ({
        id: t.id,
        creadoEn: t.createdAt,
        usuario: t.user.email,
      })),
      ejecutadoEn: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON] Error al expirar turnos:", error);
    return NextResponse.json(
      { error: "Error interno al expirar turnos", detalle: error.message },
      { status: 500 }
    );
  }
}