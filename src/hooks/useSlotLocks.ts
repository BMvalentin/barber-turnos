"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { listarLocksDelDia } from "@/actions/turnos/locks/listar-locks.actions";
import { crearLockSlot } from "@/actions/turnos/locks/crear-lock.actions";
import { eliminarLockSlot } from "@/actions/turnos/locks/eliminar-lock.actions";
import { renovarLockSlot } from "@/actions/turnos/locks/renovar-lock.actions";

interface UseSlotLocksOptions {
  barberoId: string;
  fecha: Date | undefined;
  sessionId: string;
  userId: string;
  activo?: boolean;
}

interface SlotLockEntry {
  slot: string;
}

/**
 * Hook de bloqueo de slots con server actions y caché.
 */
export function useSlotLocks({
  barberoId,
  fecha,
  sessionId,
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
      const resultado = await listarLocksDelDia(barberoId, fechaStr);
      if (resultado.success && Array.isArray(resultado.data)) {
        setSlotsBlockeados(resultado.data.map((slot) => ({ slot })));
      }
    } catch {
      // Silencioso
    }
  }, [barberoId, fechaStr]);

  // ── POST: crear / actualizar lock via action ─────────────────
  const crearLockAction = useCallback(
    async (slot: string) => {
      if (!barberoId) return;
      try {
        await crearLockSlot(barberoId, slot, sessionId);
        await fetchLocks();
      } catch {
        // Silencioso
      }
    },
    [barberoId, sessionId, fetchLocks]
  );

  // ── DELETE: eliminar lock via action ──────────────────────────
  const eliminarLockAction = useCallback(async () => {
    try {
      await eliminarLockSlot(sessionId);
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
        await renovarLockSlot(sessionId);
      } catch {
        // Silencioso
      }
    }, 60_000);

    fetchLocks();

    return () => {
      clearInterval(polling);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (slotActivoRef.current) {
        eliminarLockSlot(sessionId).catch(() => {});
      }
    };
  }, [fetchLocks, sessionId, activo]);

  const lockSlot = useCallback(
    (slot: string) => {
      slotActivoRef.current = slot;
      crearLockAction(slot);
    },
    [crearLockAction]
  );

  const unlockSlot = useCallback(() => {
    slotActivoRef.current = null;
    eliminarLockAction();
  }, [eliminarLockAction]);

  const isSlotBloqueado = useCallback(
    (slot: string) => slotsBlockeados.some((l) => l.slot === slot),
    [slotsBlockeados]
  );

  return { slotsBlockeados, lockSlot, unlockSlot, isSlotBloqueado };
}
