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
  const solicitudLocksRef = useRef(0);

  const fechaStr = fecha ? format(fecha, "yyyy-MM-dd") : null;

  // ── GET: leer locks de otros usuarios ────────────────────────────────
  const fetchLocks = useCallback(async () => {
    if (!barberoId || !fechaStr) return;
    const idSolicitud = ++solicitudLocksRef.current;
    try {
      const resultado = await listarLocksDelDia(barberoId, fechaStr);
      if (
        idSolicitud === solicitudLocksRef.current &&
        resultado.success &&
        Array.isArray(resultado.data)
      ) {
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
      } catch {
        // Silencioso
      }
    },
    [barberoId, sessionId]
  );

  // ── DELETE: eliminar lock via action ──────────────────────────
  const eliminarLockAction = useCallback(async () => {
    try {
      await eliminarLockSlot(sessionId);
    } catch {
      // Silencioso
    }
  }, [sessionId]);

  // ── Efecto principal: polling + heartbeat ────────────────────
  useEffect(() => {
    if (!activo || !barberoId || !fechaStr) {
      solicitudLocksRef.current += 1;
      setSlotsBlockeados([]);
      return;
    }

    let polling: ReturnType<typeof setInterval> | null = null;

    const detenerPolling = () => {
      if (!polling) return;
      clearInterval(polling);
      polling = null;
    };

    const iniciarPolling = () => {
      if (polling || document.visibilityState === "hidden") return;
      void fetchLocks();
      polling = setInterval(fetchLocks, 10_000);
    };

    const manejarVisibilidad = () => {
      if (document.visibilityState === "hidden") detenerPolling();
      else iniciarPolling();
    };

    heartbeatRef.current = setInterval(async () => {
      if (!slotActivoRef.current) return;
      try {
        await renovarLockSlot(sessionId);
      } catch {
        // Silencioso
      }
    }, 60_000);

    iniciarPolling();
    document.addEventListener("visibilitychange", manejarVisibilidad);

    return () => {
      solicitudLocksRef.current += 1;
      detenerPolling();
      document.removeEventListener("visibilitychange", manejarVisibilidad);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (slotActivoRef.current) {
        slotActivoRef.current = null;
        eliminarLockSlot(sessionId).catch(() => {});
      }
    };
  }, [fetchLocks, sessionId, activo, barberoId, fechaStr]);

  const lockSlot = useCallback(
    (slot: string) => {
      slotActivoRef.current = slot;
      crearLockAction(slot);
    },
    [crearLockAction]
  );

  const unlockSlot = useCallback(() => {
    if (!slotActivoRef.current) return;
    slotActivoRef.current = null;
    eliminarLockAction();
  }, [eliminarLockAction]);

  const isSlotBloqueado = useCallback(
    (slot: string) => slotsBlockeados.some((l) => l.slot === slot),
    [slotsBlockeados]
  );

  return { slotsBlockeados, lockSlot, unlockSlot, isSlotBloqueado };
}
