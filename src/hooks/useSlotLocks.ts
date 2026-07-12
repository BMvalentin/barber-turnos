"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";

interface UseSlotLocksOptions {
  barberoId: string;
  fecha: Date | undefined;
  sessionId: string;
  userId: string;
}

export type WsEstado = "conectando" | "conectado" | "desconectado";

interface SlotLockEntry {
  slot: string;
  sessionId: string;
  userId: string;
}

/**
 * Hook de bloqueo de slots en tiempo real.
 */
export function useSlotLocks({
  barberoId,
  fecha,
  sessionId,
  userId,
}: UseSlotLocksOptions) {
  const [slotsBlockeados, setSlotsBlockeados] = useState<SlotLockEntry[]>([]);
  const [wsEstado, setWsEstado] = useState<WsEstado>("desconectado");

  const wsRef = useRef<WebSocket | null>(null);
  const slotActivoRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconectarRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── WebSocket ─────────────────────────────────────
  const conectarWS = useCallback(() => {
    // Si estamos en desarrollo, no intentamos conectar
    if (process.env.NODE_ENV === "development") return;
    if (!barberoId || !userId) return;

    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
      wsRef.current = ws;
      setWsEstado("conectando");

      ws.onopen = () => {
        setWsEstado("conectado");
        if (barberoId && fechaStr) {
          ws.send(JSON.stringify({ type: "INIT", barberoId, fecha: fechaStr }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "LOCKS_STATE" && Array.isArray(msg.locks)) {
            setSlotsBlockeados(msg.locks);
          }
        } catch {
          // Ignorar
        }
      };

      ws.onclose = () => {
        setWsEstado("desconectado");
        reconectarRef.current = setTimeout(conectarWS, 8_000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setWsEstado("desconectado");
    }
  }, [barberoId, userId, fechaStr]);

  // ── Efecto principal ────────────────────────
  useEffect(() => {
    pollingRef.current = setInterval(fetchLocks, 3_000);

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

    conectarWS();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (reconectarRef.current) clearTimeout(reconectarRef.current);
      wsRef.current?.close();
      if (slotActivoRef.current) {
        fetch("/api/slot-locks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }
    };
  }, [conectarWS, fetchLocks, sessionId]);

  // ── Re-fetch inmediato ─────────────────────
  useEffect(() => {
    if (fechaStr && barberoId) {
      fetchLocks();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "INIT", barberoId, fecha: fechaStr })
        );
      }
    }
  }, [fechaStr, barberoId, fetchLocks]);

  // ── Reiniciar polling ───────────────────────────────
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(fetchLocks, 3_000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchLocks]);

  const lockSlot = useCallback(
    (slot: string) => {
      slotActivoRef.current = slot;
      crearLockREST(slot);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "LOCK", barberoId, slot, sessionId, userId })
        );
      }
    },
    [barberoId, userId, sessionId, crearLockREST]
  );

  const unlockSlot = useCallback(() => {
    slotActivoRef.current = null;
    eliminarLockREST();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "UNLOCK", sessionId }));
    }
  }, [sessionId, eliminarLockREST]);

  const isSlotBloqueado = useCallback(
    (slot: string) =>
      slotsBlockeados.some(
        (l) => l.slot === slot && l.sessionId !== sessionId
      ),
    [slotsBlockeados, sessionId]
  );

  return { slotsBlockeados, lockSlot, unlockSlot, isSlotBloqueado, wsEstado };
}

