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
  consultarDia?: boolean;
}

interface SlotLockEntry {
  slot: string;
}

type SeleccionBloqueo = { slot: string; estado: "pendiente" | "adquirido" | "inactivo" };

const INTERVALO_CONSULTA_MS = 10_000;
const INTERVALO_RENOVACION_MS = 60_000;

/**
 * Hook de bloqueo de slots con server actions y caché.
 */
export function useSlotLocks({
  barberoId,
  fecha,
  sessionId,
  activo = true,
  consultarDia = true,
}: UseSlotLocksOptions) {
  const [slotsBlockeados, setSlotsBlockeados] = useState<SlotLockEntry[]>([]);
  const seleccionRef = useRef<SeleccionBloqueo | null>(null);
  const renovacionEnCursoRef = useRef(false);
  const consultaEnCursoRef = useRef<Promise<unknown> | null>(null);
  const refrescarLocksRef = useRef<(() => void) | null>(null);

  const fechaStr = fecha ? format(fecha, "yyyy-MM-dd") : null;

  useEffect(() => {
    setSlotsBlockeados([]);
    if (!activo || !consultarDia || !barberoId || !fechaStr) return;

    let vigente = true;
    let consultando = false;
    let actualizacionSolicitada = false;
    let proximaConsulta = 0;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const pestanaOculta = () => document.visibilityState === "hidden";

    async function consultar(id: string, dia: string) {
      if (consultando || pestanaOculta()) return;
      consultando = true;
      clearTimeout(temporizador);

      // Al cambiar de fecha, se espera a que termine la última consulta antes de pedir otra.
      await consultaEnCursoRef.current;
      if (!vigente || pestanaOculta()) {
        consultando = false;
        return;
      }

      actualizacionSolicitada = false;
      const consulta = listarLocksDelDia(id, dia).catch(() => null);
      consultaEnCursoRef.current = consulta;
      const resultado = await consulta;
      consultaEnCursoRef.current = null;
      consultando = false;
      if (!vigente) return;

      if (resultado?.success && Array.isArray(resultado.data)) {
        setSlotsBlockeados(resultado.data.map((slot) => ({ slot })));
      }
      proximaConsulta = actualizacionSolicitada ? 0 : Date.now() + INTERVALO_CONSULTA_MS;
      programarConsulta();
    }

    const refrescar = () => { void consultar(barberoId, fechaStr); };

    function programarConsulta() {
      clearTimeout(temporizador);
      if (vigente && !consultando && !pestanaOculta()) {
        temporizador = setTimeout(refrescar, Math.max(0, proximaConsulta - Date.now()));
      }
    }

    refrescarLocksRef.current = () => {
      // Una consulta anterior al conflicto puede devolver datos desactualizados.
      actualizacionSolicitada = true;
      proximaConsulta = 0;
      programarConsulta();
    };
    programarConsulta();
    document.addEventListener("visibilitychange", programarConsulta);
    return () => {
      vigente = false;
      refrescarLocksRef.current = null;
      clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", programarConsulta);
    };
  }, [activo, barberoId, consultarDia, fechaStr]);

  const refrescarLocks = useCallback(() => {
    refrescarLocksRef.current?.();
  }, []);

  const unlockSlot = useCallback(() => {
    if (!seleccionRef.current) return;
    seleccionRef.current = null;
    void eliminarLockSlot(sessionId).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (!activo || !barberoId || !fechaStr) return;

    const renovacion = setInterval(async () => {
      const seleccion = seleccionRef.current;
      if (seleccion?.estado !== "adquirido" || renovacionEnCursoRef.current) return;
      renovacionEnCursoRef.current = true;
      try {
        const resultado = await renovarLockSlot(sessionId);
        if (resultado.renovado === false) seleccion.estado = "inactivo";
      } catch {
        // Se vuelve a intentar en el próximo intervalo si el lock sigue vigente.
      } finally {
        renovacionEnCursoRef.current = false;
      }
    }, INTERVALO_RENOVACION_MS);

    return () => {
      clearInterval(renovacion);
      unlockSlot();
    };
  }, [activo, barberoId, fechaStr, sessionId, unlockSlot]);

  const lockSlot = useCallback(
    (slot: string) => {
      const previa = seleccionRef.current;
      if (!barberoId || (previa?.slot === slot && previa.estado !== "inactivo")) return;
      const seleccion: SeleccionBloqueo = { slot, estado: "pendiente" };
      seleccionRef.current = seleccion;
      void crearLockSlot(barberoId, slot, sessionId)
        .then((resultado) => { seleccion.estado = resultado.success ? "adquirido" : "inactivo"; })
        .catch(() => { seleccion.estado = "inactivo"; });
    },
    [barberoId, sessionId]
  );

  const isSlotBloqueado = useCallback(
    (slot: string) => slotsBlockeados.some((l) => l.slot === slot),
    [slotsBlockeados]
  );

  return { slotsBlockeados, lockSlot, unlockSlot, isSlotBloqueado, refrescarLocks };
}
