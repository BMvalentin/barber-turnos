"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";

interface UseSlotLocksOptions {
  barberoId: string;
  fecha: Date | undefined;
  sessionId: string;
  userId: string;
  activo?: boolean;
}

interface SlotLockEntry {
  slot: string;
  sessionId: string;
  userId: string;
}

/**
 * Hook de bloqueo de slots con polling REST.
 */
export function useSlotLocks({
  barberoId,
  fecha,
  sessionId,
  userId,
  activo = true,
}: UseSlotLocksOptions) {
  const [slotsBlockeados, setSlotsBlockeados] = useState<SlotLockEntry[]>([]);

  const slotActivoRef = useRef<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fechaStr = fecha ? format(fecha, "yyyy-MM-dd") : null;

  // ── GET: leer locks de otros usuarios ────────────────────────────────
  const fetchLocks = useCallback(async () => {
    if (!barberoId || !fechaStr) return;
    try {
      const res = await fetch(
        `/api/slot-locks?barberoId=${barberoId}&fecha=${fechaStr}&sessionId=${sessionId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.locks)) {
        setSlotsBlockeados(data.locks);
      }
    } catch {
      // Silencioso
    }
  }, [barberoId, fechaStr, sessionId]);

  // ── POST: crear / actualizar lock via REST ─────────────────
  const crearLockREST = useCallback(
    async (slot: string) => {
      if (!barberoId || !userId) return;
      try {
        await fetch("/api/slot-locks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barberoId, slot, sessionId, userId }),
        });
        await fetchLocks();
      } catch {
        // Silencioso
      }
    },
    [barberoId, userId, sessionId, fetchLocks]
  );

  // ── DELETE: eliminar lock via REST ──────────────────────────
  const eliminarLockREST = useCallback(async () => {
    try {
      await fetch("/api/slot-locks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      await fetchLocks();
    } catch {
      // Silencioso
    }
  }, [sessionId, fetchLocks]);

  // ── Efecto principal: polling + heartbeat ────────────────────
  useEffect(() => {
    if (!activo) return;

    const polling = setInterval(fetchLocks, 10_000);

    heartbeatRef.current = setInterval(async () => {
      if (!slotActivoRef.current) return;
      try {
        await fetch("/api/slot-locks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      } catch {
        // Silencioso
      }
    }, 60_000);

    fetchLocks();

    return () => {
      clearInterval(polling);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (slotActivoRef.current) {
        fetch("/api/slot-locks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }
    };
  }, [fetchLocks, sessionId, activo]);

  const lockSlot = useCallback(
    (slot: string) => {
      slotActivoRef.current = slot;
      crearLockREST(slot);
    },
    [crearLockREST]
  );

  const unlockSlot = useCallback(() => {
    slotActivoRef.current = null;
    eliminarLockREST();
  }, [eliminarLockREST]);

  const isSlotBloqueado = useCallback(
    (slot: string) =>
      slotsBlockeados.some(
        (l) => l.slot === slot && l.sessionId !== sessionId
      ),
    [slotsBlockeados, sessionId]
  );

  return { slotsBlockeados, lockSlot, unlockSlot, isSlotBloqueado };
}
