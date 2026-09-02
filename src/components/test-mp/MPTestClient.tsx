"use client";
// src/components/test-mp/MPTestClient.tsx

import type { Turno } from "./tipos";
import { usePruebasMercadoPago } from "@/hooks/usoPruebasMercadoPago";
import { ListaTurnos } from "./ListaTurnos";
import { InfoTurno } from "./InfoTurno";
import { FlujoPago } from "./FlujoPago";
import { ConfirmacionManual } from "./ConfirmacionManual";
import { SimularWebhook } from "./SimularWebhook";
import { TarjetasPrueba } from "./TarjetasPrueba";
import { PanelConsole } from "./PanelConsole";

export function MPTestClient({ turnos: initialTurnos }: { turnos: Turno[] }) {
  const {
    turnos,
    selectedId,
    seleccionarTurno,
    selectedTurno,
    logs,
    limpiarLogs,
    endRef,
    loading,
    manualPaymentId,
    setManualPaymentId,
    manualTurnoId,
    setManualTurnoId,
    crearPreferencia,
    abrirCheckout,
    confirmarManual,
    verificarEstado,
    simularWebhook,
  } = usePruebasMercadoPago(initialTurnos);

  return (
    <div
      className="min-h-screen bg-[#0d0d0d] text-zinc-100"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
    >
      {/* ── Header ── */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-zinc-500 text-sm">urban-barber</span>
          <span className="text-zinc-700">/</span>
          <span className="text-amber-400 text-sm font-bold">test-mp</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          SANDBOX MODE
        </div>
      </header>

      {/* ── Warning banner ── */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-xs text-amber-400 flex items-center gap-2">
        <span>⚠</span>
        <span>
          Ruta de testing — solo disponible en <strong>NODE_ENV=development</strong>.
          Eliminá <code className="bg-amber-400/10 px-1 rounded">app/test-mp/</code> antes de deployar a producción.
        </span>
      </div>

      <div className="flex h-[calc(100vh-73px-37px)]">
        <ListaTurnos
          turnos={turnos}
          selectedId={selectedId}
          onSelect={seleccionarTurno}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedTurno ? (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              Seleccioná un turno de la lista →
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <InfoTurno turno={selectedTurno} />
              <FlujoPago
                turno={selectedTurno}
                loading={loading}
                onCrearPreferencia={crearPreferencia}
                onAbrirCheckout={abrirCheckout}
                onVerificarEstado={verificarEstado}
              />
              <ConfirmacionManual
                value={manualPaymentId}
                onChange={setManualPaymentId}
                loading={loading}
                onConfirmar={confirmarManual}
              />
              <SimularWebhook
                turno={selectedTurno}
                value={manualTurnoId}
                onChange={setManualTurnoId}
                loading={loading}
                onSimular={simularWebhook}
              />
              <TarjetasPrueba />
            </div>
          )}
        </main>

        <PanelConsole logs={logs} onClear={limpiarLogs} endRef={endRef} />
      </div>
    </div>
  );
}
