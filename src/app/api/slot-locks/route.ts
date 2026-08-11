import { NextRequest, NextResponse } from "next/server";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad";
import { TTL_LOCK_SLOT_MS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * GET /api/slot-locks?barberoId=X&fecha=YYYY-MM-DD
 * Devuelve los slots bloqueados por OTROS usuarios (excluye los del usuario
 * autenticado). No expone sessionId ni userId ajenos. Solo lectura.
 */
export async function GET(req: NextRequest) {
  const sesion = await requerirSesion();
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const barberoId = searchParams.get("barberoId");
    const fecha = searchParams.get("fecha");

    if (!barberoId || !fecha) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const now = new Date();

    // Rango horario del día completo en Argentina
    const inicio = fromZonedTime(`${fecha}T00:00:00`, TIMEZONE);
    const fin = fromZonedTime(`${fecha}T23:59:59`, TIMEZONE);

    const locks = await prisma.slotLock.findMany({
      where: {
        barberoId,
        horarioReservado: { gte: inicio, lte: fin },
        expiresAt: { gt: now },
        NOT: { userId: sesion.user.id },
      },
      select: {
        horarioReservado: true,
      },
    });

    return NextResponse.json({
      locks: locks.map((l) => ({
        slot: l.horarioReservado.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[slot-locks GET]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * POST /api/slot-locks
 * Body: { barberoId, slot (ISO), sessionId }
 * Crea el lock del usuario autenticado (máximo 1 lock activo por usuario).
 * El userId del body se ignora: SIEMPRE se usa el de la sesión.
 */
export async function POST(req: NextRequest) {
  const sesion = await requerirSesion();
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { barberoId, slot, sessionId } = body;

    if (!barberoId || !slot || !sessionId) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const horarioReservado = new Date(slot);
    const expiresAt = new Date(Date.now() + TTL_LOCK_SLOT_MS);

    // Eliminar lock anterior de este usuario (cambió de slot)
    await prisma.slotLock.deleteMany({ where: { userId: sesion.user.id } });

    await prisma.slotLock.create({
      data: {
        barberoId,
        horarioReservado,
        userId: sesion.user.id,
        sessionId,
        expiresAt,
      },
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
 * Elimina el lock del usuario autenticado que tenga ese sessionId.
 */
export async function DELETE(req: NextRequest) {
  const sesion = await requerirSesion();
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Falta sessionId" }, { status: 400 });
    }

    await prisma.slotLock.deleteMany({
      where: { sessionId, userId: sesion.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[slot-locks DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * PATCH /api/slot-locks
 * Body: { sessionId }
 * Renueva el TTL del lock activo del usuario autenticado (heartbeat).
 */
export async function PATCH(req: NextRequest) {
  const sesion = await requerirSesion();
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Falta sessionId" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + TTL_LOCK_SLOT_MS);
    await prisma.slotLock.updateMany({
      where: { sessionId, userId: sesion.user.id },
      data: { expiresAt },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[slot-locks PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}