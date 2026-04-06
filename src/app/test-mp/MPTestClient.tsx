"use client";
// app/test-mp/MPTestClient.tsx

import { useState, useRef, useEffect } from "react";
import {
  crearPreferenciaPago,
  confirmarPagoTurno,
  verificarEstadoPago,
} from "@/actions/mercadopago-actions";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Turno = {
  id: string;
  estado: string;
  horarioReservado: string;
  precioCongelado: number;
  seniaCongelada: number;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  userName: string | null;
  userEmail: string | null;
  servicioNombre: string;
  barberoNombre: string;
};

type LogEntry = {
  id: string;
  ts: string;
  type: "info" | "success" | "error" | "warn" | "request" | "response";
  label: string;
  payload?: any;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE:  "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  CONFIRMADO: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  CANCELADO:  "text-red-400 border-red-400/30 bg-red-400/5",
  COMPLETADO: "text-blue-400 border-blue-400/30 bg-blue-400/5",
};

const ESTADO_DOT: Record<string, string> = {
  PENDIENTE:  "bg-yellow-400",
  CONFIRMADO: "bg-emerald-400",
  CANCELADO:  "bg-red-400",
  COMPLETADO: "bg-blue-400",
};

const LOG_COLOR: Record<LogEntry["type"], string> = {
  info:     "text-zinc-400",
  success:  "text-emerald-400",
  error:    "text-red-400",
  warn:     "text-yellow-400",
  request:  "text-sky-400",
  response: "text-violet-400",
};

const LOG_PREFIX: Record<LogEntry["type"], string> = {
  info:     "●",
  success:  "✓",
  error:    "✗",
  warn:     "⚠",
  request:  "→",
  response: "←",
};

function nowTs() {
  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

function shortId(id: string) {
  return id.slice(0, 8) + "...";
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function MPTestClient({ turnos: initialTurnos }: { turnos: Turno[] }) {
  const [turnos, setTurnos] = useState<Turno[]>(initialTurnos);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTurnos[0]?.id ?? null
  );
  // Vacío en SSR para evitar hydration mismatch con timestamps dinámicos
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setLogs([{
      id: "init",
      ts: nowTs(),
      type: "info",
      label: "Panel de testing MP inicializado",
      payload: { totalTurnos: initialTurnos.length, env: "development" },
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loading, setLoading] = useState<string | null>(null);
  const [manualPaymentId, setManualPaymentId] = useState("");
  const [manualTurnoId, setManualTurnoId] = useState("");
  const logEndRef = useRef<HTMLDivElement>(null);

  const selectedTurno = turnos.find((t) => t.id === selectedId) ?? null;

  // ── Logging ──────────────────────────────────────────────────────────────────

  const log = (type: LogEntry["type"], label: string, payload?: any) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).slice(2),
      ts: nowTs(),
      type,
      label,
      payload,
    };
    setLogs((prev) => [...prev, entry]);
    setTimeout(() => {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // ── Sync estado de turno local ────────────────────────────────────────────────

  const syncTurno = async (id: string) => {
    const result = await verificarEstadoPago(id);
    if (result.success) {
      setTurnos((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                estado: result.data.estado,
                mpPaymentId: result.data.mpPaymentId,
                mpPreferenceId: result.data.mpPreferenceId,
              }
            : t
        )
      );
    }
  };

  // ─── Acción 1: Crear preferencia ─────────────────────────────────────────────

  const handleCrearPreferencia = async () => {
    if (!selectedTurno) return;
    setLoading("crear");
    log("request", "crearPreferenciaPago()", { turnoId: selectedTurno.id });

    const result = await crearPreferenciaPago(selectedTurno.id);

    if (result.success) {
      log("success", "Preferencia creada correctamente", result.data);
      await syncTurno(selectedTurno.id);
    } else {
      log("error", `Error al crear preferencia: ${result.error}`, result);
    }
    setLoading(null);
  };

  // ─── Acción 2: Abrir checkout ─────────────────────────────────────────────────

  const handleAbrirCheckout = (url: string | undefined) => {
    if (!url) return;
    log("info", "Abriendo checkout de Mercado Pago...", { url });
    window.open(url, "_blank");
  };

  // ─── Acción 3: Confirmar pago manualmente ─────────────────────────────────────

  const handleConfirmarManual = async () => {
    if (!selectedTurno) return;
    setLoading("confirmar");
    const pid = manualPaymentId.trim() || undefined;
    log("request", "confirmarPagoTurno() — confirmación manual", {
      turnoId: selectedTurno.id,
      paymentId: pid ?? "(sin paymentId)",
    });

    const result = await confirmarPagoTurno(selectedTurno.id, pid);

    if (result.success) {
      log("success", "Turno confirmado correctamente", result.data);
      await syncTurno(selectedTurno.id);
    } else {
      log("error", `Error al confirmar: ${result.error}`, result);
    }
    setLoading(null);
  };

  // ─── Acción 4: Verificar estado ───────────────────────────────────────────────

  const handleVerificarEstado = async () => {
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

  // ─── Acción 5: Simular webhook ────────────────────────────────────────────────

  const handleSimularWebhook = async () => {
    const tid = manualTurnoId.trim() || selectedTurno?.id;
    if (!tid) {
      log("error", "Necesitás un turnoId para simular el webhook");
      return;
    }
    setLoading("webhook");
    log("request", "POST /api/mercadopago/webhook (simulado)", {
      type: "payment",
      data: { id: "SIMULATED_PAYMENT_ID" },
    });

    try {
      const res = await fetch("/api/mercadopago/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment",
          data: { id: "TEST_000000000" },
          action: "payment.updated",
          external_reference: tid,
        }),
      });
      const body = await res.json();
      log(
        res.ok ? "response" : "error",
        `Webhook → ${res.status} ${res.statusText}`,
        body
      );
    } catch (err: any) {
      log("error", `Error llamando al webhook: ${err.message}`);
    }
    setLoading(null);
  };

  // ─── Limpiar logs ────────────────────────────────────────────────────────────

  const clearLogs = () => {
    setLogs([{
      id: "clear",
      ts: nowTs(),
      type: "info",
      label: "Logs limpiados",
    }]);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────────

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
        {/* ── Panel izquierdo: lista de turnos ── */}
        <aside className="w-64 border-r border-zinc-800 flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
              Turnos ({turnos.length})
            </p>
          </div>
          <div className="overflow-y-auto flex-1">
            {turnos.length === 0 && (
              <p className="px-4 py-6 text-zinc-600 text-xs text-center">
                No hay turnos en la base de datos.
              </p>
            )}
            {turnos.map((turno) => (
              <button
                key={turno.id}
                onClick={() => setSelectedId(turno.id)}
                className={`w-full text-left px-4 py-3 border-b border-zinc-800/60 transition-colors hover:bg-zinc-800/40 ${
                  selectedId === turno.id
                    ? "bg-zinc-800 border-l-2 border-l-amber-400"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400">{shortId(turno.id)}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                      ESTADO_COLOR[turno.estado] ?? "text-zinc-400"
                    }`}
                  >
                    {turno.estado}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 truncate">{turno.servicioNombre}</p>
                <p className="text-xs text-zinc-600 truncate">{turno.userName}</p>
                <p className="text-xs text-amber-500/70 mt-1">
                  ${turno.seniaCongelada.toLocaleString("es-AR")} seña
                </p>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Panel central: acciones ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedTurno ? (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              Seleccioná un turno de la lista →
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Info del turno seleccionado */}
              <section className="border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                    Turno seleccionado
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ESTADO_DOT[selectedTurno.estado] ?? "bg-zinc-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        ESTADO_COLOR[selectedTurno.estado]?.split(" ")[0] ?? "text-zinc-400"
                      }`}
                    >
                      {selectedTurno.estado}
                    </span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  {[
                    ["ID", selectedTurno.id],
                    ["Servicio", selectedTurno.servicioNombre],
                    ["Barbero", selectedTurno.barberoNombre],
                    ["Cliente", selectedTurno.userName ?? "-"],
                    ["Email", selectedTurno.userEmail ?? "-"],
                    [
                      "Horario",
                      new Date(selectedTurno.horarioReservado).toLocaleString("es-AR", {
                        timeZone: "America/Argentina/Buenos_Aires",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    ],
                    [
                      "Precio",
                      `$${selectedTurno.precioCongelado.toLocaleString("es-AR")}`,
                    ],
                    [
                      "Seña",
                      `$${selectedTurno.seniaCongelada.toLocaleString("es-AR")}`,
                    ],
                    [
                      "mp_preference_id",
                      selectedTurno.mpPreferenceId
                        ? shortId(selectedTurno.mpPreferenceId)
                        : "null",
                    ],
                    [
                      "mp_payment_id",
                      selectedTurno.mpPaymentId ?? "null",
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-zinc-600 w-36 flex-shrink-0">{k}</span>
                      <span
                        className={`text-zinc-300 font-mono truncate ${
                          v === "null" ? "text-zinc-700 italic" : ""
                        }`}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Flujo de pago ── */}
              <section className="border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                    Flujo de pago
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs text-zinc-500 flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-zinc-300">
                        Crear preferencia de pago en MP
                      </p>
                      <p className="text-xs text-zinc-600">
                        Llama a <code className="text-sky-400">crearPreferenciaPago(turnoId)</code>. 
                        Guarda el <code className="text-violet-400">mpPreferenceId</code> en el turno.
                      </p>
                      <button
                        onClick={handleCrearPreferencia}
                        disabled={loading !== null}
                        className="px-4 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-lg text-xs font-bold hover:bg-sky-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {loading === "crear" ? "⟳ Creando..." : "→ crearPreferenciaPago()"}
                      </button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs text-zinc-500 flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-zinc-300">
                        Abrir checkout de Mercado Pago
                      </p>
                      <p className="text-xs text-zinc-600">
                        Redirige al usuario al{" "}
                        <code className="text-violet-400">sandbox_init_point</code>. 
                        Usá tarjeta de prueba: <span className="text-amber-400">4509 9535 6623 3704</span>,
                        vto: <span className="text-amber-400">11/25</span>, CVV: <span className="text-amber-400">123</span>
                      </p>
                      {selectedTurno.mpPreferenceId ? (
                        <button
                          onClick={() => {
                            const pid = selectedTurno.mpPreferenceId!;
                            const sandboxUrl = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${pid}`;
                            handleAbrirCheckout(sandboxUrl);
                          }}
                          className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-colors"
                        >
                          ↗ Abrir Checkout Sandbox
                        </button>
                      ) : (
                        <p className="text-xs text-zinc-700 italic">
                          Primero creá la preferencia (paso 1)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs text-zinc-500 flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-zinc-300">
                        Verificar estado (polling)
                      </p>
                      <p className="text-xs text-zinc-600">
                        Llama a <code className="text-sky-400">verificarEstadoPago()</code> para 
                        ver si el webhook ya actualizó el estado.
                      </p>
                      <button
                        onClick={handleVerificarEstado}
                        disabled={loading !== null}
                        className="px-4 py-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-lg text-xs font-bold hover:bg-violet-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {loading === "verificar" ? "⟳ Verificando..." : "↻ verificarEstadoPago()"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Confirmación manual ── */}
              <section className="border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                    Confirmación manual (simula back_url success)
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-zinc-600">
                    Confirma el turno sin pasar por el checkout. Útil para probar que el estado cambia a{" "}
                    <span className="text-emerald-400">CONFIRMADO</span>.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="payment_id (opcional)"
                      value={manualPaymentId}
                      onChange={(e) => setManualPaymentId(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <button
                      onClick={handleConfirmarManual}
                      disabled={loading !== null}
                      className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading === "confirmar" ? "⟳ Confirmando..." : "✓ Confirmar turno"}
                    </button>
                  </div>
                </div>
              </section>

              {/* ── Simular webhook ── */}
              <section className="border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                    Simular notificación webhook
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-zinc-600">
                    Hace un POST a <code className="text-sky-400">/api/mercadopago/webhook</code> con 
                    un paymentId de prueba. El webhook intentará consultar ese pago a la API de MP.
                    Con el token de sandbox devolverá error si el ID no existe — es normal.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`turnoId (por defecto: ${shortId(selectedTurno.id)})`}
                      value={manualTurnoId}
                      onChange={(e) => setManualTurnoId(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/50 transition-colors"
                    />
                    <button
                      onClick={handleSimularWebhook}
                      disabled={loading !== null}
                      className="px-4 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-lg text-xs font-bold hover:bg-sky-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading === "webhook" ? "⟳ Enviando..." : "→ POST webhook"}
                    </button>
                  </div>
                </div>
              </section>

              {/* ── Tarjetas de prueba ── */}
              <section className="border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                    Tarjetas de prueba (sandbox)
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 gap-3 text-xs">
                  {[
                    {
                      label: "✓ Aprobada",
                      numero: "4509 9535 6623 3704",
                      vto: "11/25",
                      cvv: "123",
                      nombre: "APRO",
                      color: "border-emerald-500/20 text-emerald-400",
                    },
                    {
                      label: "✗ Rechazada",
                      numero: "3743 781877 55283",
                      vto: "11/25",
                      cvv: "1234",
                      nombre: "OTHE",
                      color: "border-red-500/20 text-red-400",
                    },
                    {
                      label: "⏳ Pendiente",
                      numero: "4075 5957 1648 3764",
                      vto: "11/25",
                      cvv: "123",
                      nombre: "CONT",
                      color: "border-yellow-500/20 text-yellow-400",
                    },
                  ].map((card) => (
                    <div
                      key={card.numero}
                      className={`border rounded-lg p-3 ${card.color} bg-zinc-900/30`}
                    >
                      <p className="font-bold mb-2">{card.label}</p>
                      <div className="grid grid-cols-3 gap-2 text-zinc-400">
                        <div>
                          <span className="text-zinc-600 block">Número</span>
                          <span className="font-mono text-zinc-300">{card.numero}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block">Vto / CVV</span>
                          <span className="font-mono text-zinc-300">
                            {card.vto} / {card.cvv}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block">Titular</span>
                          <span className="font-mono text-zinc-300">{card.nombre}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* ── Panel derecho: logs ── */}
        <aside className="w-80 border-l border-zinc-800 flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
              Console
            </p>
            <button
              onClick={clearLogs}
              className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-[11px]">
            {logs.map((entry) => (
              <div key={entry.id} className="group">
                <div className="flex items-start gap-2">
                  <span className="text-zinc-700 flex-shrink-0 tabular-nums">
                    {entry.ts}
                  </span>
                  <span
                    className={`flex-shrink-0 ${LOG_COLOR[entry.type]}`}
                  >
                    {LOG_PREFIX[entry.type]}
                  </span>
                  <span className={`${LOG_COLOR[entry.type]} leading-relaxed`}>
                    {entry.label}
                  </span>
                </div>
                {entry.payload && (
                  <pre className="mt-1 ml-7 text-[10px] text-zinc-600 bg-zinc-900/40 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all border border-zinc-800/50">
                    {JSON.stringify(entry.payload, null, 2)}
                  </pre>
                )}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </aside>
      </div>
    </div>
  );
}