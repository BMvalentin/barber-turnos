import { experimental_upgradeWebSocket } from "@vercel/functions";
import { prisma } from "@/lib/prisma";

const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutos

export const dynamic = "force-dynamic";

export async function GET() {
  return experimental_upgradeWebSocket(async (ws) => {
    let currentSessionId: string | null = null;

    ws.on("message", async (rawData: any) => {
      try {
        const msg = JSON.parse(rawData.toString());

        switch (msg.type) {
          // ── INIT: el cliente se conecta y pide el estado actual ──────────
          case "INIT": {
            const { barberoId, fecha } = msg;
            if (!barberoId || !fecha) break;

            const now = new Date();
            // Limpiar locks expirados de paso
            await prisma.slotLock.deleteMany({
              where: { expiresAt: { lt: now } },
            });

            const locks = await prisma.slotLock.findMany({
              where: {
                barberoId,
                horarioReservado: {
                  gte: new Date(`${fecha}T00:00:00Z`),
                  lte: new Date(`${fecha}T23:59:59Z`),
                },
                expiresAt: { gt: now },
              },
              select: { horarioReservado: true, sessionId: true, userId: true },
            });

            ws.send(
              JSON.stringify({
                type: "LOCKS_STATE",
                locks: locks.map((l) => ({
                  slot: l.horarioReservado.toISOString(),
                  sessionId: l.sessionId,
                  userId: l.userId,
                })),
              })
            );
            break;
          }

          // ── LOCK: el cliente seleccionó un slot ──────────────────────────
          case "LOCK": {
            const { barberoId, slot, sessionId, userId } = msg;
            if (!barberoId || !slot || !sessionId || !userId) break;

            currentSessionId = sessionId;
            const expiresAt = new Date(Date.now() + LOCK_TTL_MS);
            const horarioReservado = new Date(slot);

            // Eliminar lock anterior de este session (si cambió de slot)
            await prisma.slotLock.deleteMany({
              where: { sessionId },
            });

            await prisma.slotLock.create({
              data: { barberoId, horarioReservado, userId, sessionId, expiresAt },
            });

            ws.send(JSON.stringify({ type: "LOCK_OK", slot }));
            break;
          }

          // ── UNLOCK: el cliente deseleccionó o cerró el modal ─────────────
          case "UNLOCK": {
            const { sessionId } = msg;
            if (!sessionId) break;

            await prisma.slotLock.deleteMany({ where: { sessionId } });
            currentSessionId = null;
            ws.send(JSON.stringify({ type: "UNLOCK_OK" }));
            break;
          }

          // ── HEARTBEAT: renovar TTL del lock activo ───────────────────────
          case "HEARTBEAT": {
            if (!currentSessionId) break;
            const expiresAt = new Date(Date.now() + LOCK_TTL_MS);
            await prisma.slotLock.updateMany({
              where: { sessionId: currentSessionId },
              data: { expiresAt },
            });
            ws.send(JSON.stringify({ type: "HEARTBEAT_OK" }));
            break;
          }
        }
      } catch (err) {
        console.error("[WS] Error procesando mensaje:", err);
      }
    });

    ws.on("close", async () => {
      // Limpiar el lock del usuario al desconectarse
      if (currentSessionId) {
        try {
          await prisma.slotLock.deleteMany({ where: { sessionId: currentSessionId } });
        } catch (err) {
          console.error("[WS] Error limpiando lock en close:", err);
        }
      }
    });
  });
}
