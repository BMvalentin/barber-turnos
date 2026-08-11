"use client";
// src/components/test-mp/SimularWebhook.tsx

import type { Turno } from "./tipos";
import { cortarId } from "./cortarId";

export function SimularWebhook({
  turno,
  value,
  onChange,
  loading,
  onSimular,
}: {
  turno: Turno;
  value: string;
  onChange: (value: string) => void;
  loading: string | null;
  onSimular: () => void;
}) {
  return (
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
            placeholder={`turnoId (por defecto: ${cortarId(turno.id)})`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
          <button
            onClick={onSimular}
            disabled={loading !== null}
            className="px-4 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-lg text-xs font-bold hover:bg-sky-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading === "webhook" ? "⟳ Enviando..." : "→ POST webhook"}
          </button>
        </div>
      </div>
    </section>
  );
}