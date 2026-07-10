import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * GET /api/slot-locks?barberoId=X&fecha=YYYY-MM-DD&sessionId=MINE
 * Devuelve los slots bloqueados por OTROS usuarios (excluye el propio sessionId).
 * También limpia locks expirados de paso.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const barberoId = searchParams.get("barberoId");
    const fecha = searchParams.get("fecha");
    const mySessionId = searchParams.get("sessionId") ?? "";

    if (!barberoId || !fecha) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const now = new Date();

    // Limpiar locks expirados
    await prisma.slotLock.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    // Construir rango horario considerando zona horaria local
    // Usamos strings UTC-3 para abarcar el día completo en Argentina
    const inicio = new Date(`${fecha}T00:00:00-03:00`);
    const fin = new Date(`${fecha}T23:59:59-03:00`);

    const locks = await prisma.slotLock.findMany({
      where: {
        barberoId,
        horarioReservado: { gte: inicio, lte: fin },
        expiresAt: { gt: now },
        NOT: { sessionId: mySessionId },
      },
      select: {
        horarioReservado: true,
        sessionId: true,
        userId: true,
      },
    });

    return NextResponse.json({
      locks: locks.map((l) => ({
        slot: l.horarioReservado.toISOString(),
        sessionId: l.sessionId,
        userId: l.userId,
      })),
    });
  } catch (err) {
    console.error("[slot-locks GET]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * POST /api/slot-locks
 * Body: { barberoId, slot (ISO), sessionId, userId }
 * Crea o actualiza el lock del sessionId (upsert).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { barberoId, slot, sessionId, userId } = body;

    if (!barberoId || !slot || !sessionId || !userId) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const horarioReservado = new Date(slot);
    const expiresAt = new Date(Date.now() + LOCK_TTL_MS);

    // Eliminar lock anterior de esta sesión (cambió de slot)
    await prisma.slotLock.deleteMany({ where: { sessionId } });

    await prisma.slotLock.create({
      data: { barberoId, horarioReservado, userId, sessionId, expiresAt },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[slot-locks POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * DELETE /api/slot-locks
 * Body: { sessionId }
 * Elimina el lock de la sesión indicada.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Falta sessionId" }, { status: 400 });
    }

    await prisma.slotLock.deleteMany({ where: { sessionId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[slot-locks DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * PATCH /api/slot-locks
 * Body: { sessionId }
 * Renueva el TTL del lock activo (heartbeat).
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Falta sessionId" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + LOCK_TTL_MS);
    await prisma.slotLock.updateMany({
      where: { sessionId },
      data: { expiresAt },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[slot-locks PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
