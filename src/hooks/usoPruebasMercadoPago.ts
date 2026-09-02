"use client";
// src/hooks/usoPruebasMercadoPago.ts

import { useEffect, useRef, useState } from "react";
import { confirmarPagoTurno } from "@/actions/mercadopago/confirmar-pago.actions";
import { crearPreferenciaPago } from "@/actions/mercadopago/crear-preferencia.actions";
import { verificarEstadoPago } from "@/actions/mercadopago/verificar-estado.actions";
import type { LogEntry, Turno } from "@/components/test-mp/tipos";

function ahoraTs() {
  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

export function usePruebasMercadoPago(initialTurnos: Turno[]) {
  const [turnos, setTurnos] = useState<Turno[]>(initialTurnos);
  const [selectedId, setSelectedId] = useState<string | null>(initialTurnos[0]?.id ?? null);
  // Vacío en SSR para evitar hydration mismatch con timestamps dinámicos
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [manualPaymentId, setManualPaymentId] = useState("");
  const [manualTurnoId, setManualTurnoId] = useState("");
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs([{ id: "init", ts: ahoraTs(), type: "info", label: "Panel de testing MP inicializado", payload: { totalTurnos: initialTurnos.length, env: "development" } }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTurno = turnos.find((t) => t.id === selectedId) ?? null;

  const log = (type: LogEntry["type"], label: string, payload?: unknown) => {
    setLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), ts: ahoraTs(), type, label, payload },
    ]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const syncTurno = async (id: string) => {
    const result = await verificarEstadoPago(id);
    if (!result.success || !result.data) return;
    const { estado, mpPaymentId, mpPreferenceId } = result.data;
    setTurnos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado, mpPaymentId, mpPreferenceId } : t))
    );
  };

  const crearPreferencia = async () => {
    if (!selectedTurno) return;
    setLoading("crear");
    log("request", "crearPreferenciaPago()", { turnoId: selectedTurno.id });
    const result = await crearPreferenciaPago(selectedTurno.id, "SEÑA");
    if (result.success) {
      log("success", "Preferencia creada correctamente", result.data);
      await syncTurno(selectedTurno.id);
    } else {
      log("error", `Error al crear preferencia: ${result.error}`, result);
    }
    setLoading(null);
  };

  const abrirCheckout = (url: string | undefined) => {
    if (!url) return;
    log("info", "Abriendo checkout de Mercado Pago...", { url });
    window.open(url, "_blank");
  };

  const confirmarManual = async () => {
    if (!selectedTurno) return;
    setLoading("confirmar");
    const pid = manualPaymentId.trim() || undefined;
    log("request", "confirmarPagoTurno() — confirmación manual", { turnoId: selectedTurno.id, paymentId: pid ?? "(sin paymentId)" });
    const result = await confirmarPagoTurno(selectedTurno.id, pid);
    if (result.success) {
      log("success", "Turno confirmado correctamente", result.data);
      await syncTurno(selectedTurno.id);
    } else {
      log("error", `Error al confirmar: ${result.error}`, result);
    }
    setLoading(null);
  };

  const verificarEstado = async () => {
    if (!selectedTurno) return;
    setLoading("verificar");
    log("request", "verificarEstadoPago()", { turnoId: selectedTurno.id });
    const result = await verificarEstadoPago(selectedTurno.id);
    if (result.success) {
      log("response", "Estado del turno obtenido", result.data);
      await syncTurno(selectedTurno.id);
    } else {
      log("error", `Error al verificar: ${result.error}`, result);
    }
    setLoading(null);
  };

  const simularWebhook = async () => {
    const tid = manualTurnoId.trim() || selectedTurno?.id;
    if (!tid) {
      log("error", "Necesitás un turnoId para simular el webhook");
      return;
    }
    setLoading("webhook");
    log("request", "POST /api/mercadopago/webhook (simulado)", { type: "payment", data: { id: "SIMULATED_PAYMENT_ID" } });
    try {
      const res = await fetch("/api/mercadopago/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "payment", data: { id: "TEST_000000000" }, action: "payment.updated", external_reference: tid }),
      });
      const body = await res.json();
      log(
        res.ok ? "response" : "error",
        `Webhook → ${res.status} ${res.statusText}`,
        body
      );
    } catch (err: unknown) {
      const detalle = err instanceof Error ? err.message : String(err);
      log("error", `Error llamando al webhook: ${detalle}`);
    }
    setLoading(null);
  };

  const clearLogs = () => {
    setLogs([{ id: "clear", ts: ahoraTs(), type: "info", label: "Logs limpiados" }]);
  };

  return {
    turnos, selectedId, seleccionarTurno: setSelectedId, selectedTurno, logs,
    limpiarLogs: clearLogs, endRef: logEndRef, loading, manualPaymentId,
    setManualPaymentId, manualTurnoId, setManualTurnoId, crearPreferencia,
    abrirCheckout, confirmarManual, verificarEstado, simularWebhook,
  };
}
