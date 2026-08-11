"use client";
// src/components/test-mp/FlujoPago.tsx

import type { Turno } from "./tipos";

export function FlujoPago({
  turno,
  loading,
  onCrearPreferencia,
  onAbrirCheckout,
  onVerificarEstado,
}: {
  turno: Turno;
  loading: string | null;
  onCrearPreferencia: () => void;
  onAbrirCheckout: (url: string | undefined) => void;
  onVerificarEstado: () => void;
}) {
  return (
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
              onClick={onCrearPreferencia}
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
            {turno.mpPreferenceId ? (
              <button
                onClick={() => {
                  const pid = turno.mpPreferenceId!;
                  const sandboxUrl = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${pid}`;
                  onAbrirCheckout(sandboxUrl);
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
              onClick={onVerificarEstado}
              disabled={loading !== null}
              className="px-4 py-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-lg text-xs font-bold hover:bg-violet-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading === "verificar" ? "⟳ Verificando..." : "↻ verificarEstadoPago()"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}