"use client";
// src/components/test-mp/ConfirmacionManual.tsx

export function ConfirmacionManual({
  value,
  onChange,
  loading,
  onConfirmar,
}: {
  value: string;
  onChange: (value: string) => void;
  loading: string | null;
  onConfirmar: () => void;
}) {
  return (
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            onClick={onConfirmar}
            disabled={loading !== null}
            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading === "confirmar" ? "⟳ Confirmando..." : "✓ Confirmar turno"}
          </button>
        </div>
      </div>
    </section>
  );
}