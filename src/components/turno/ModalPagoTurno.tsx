"use client";

import { CheckCircle2, Clock, CreditCard, Loader2, Scissors } from "lucide-react";
import type { TurnoCreado } from "@/types/turno";

type Props = {
  turnoCreado: TurnoCreado;
  cargandoPago: boolean;
  errorPago: string | null;
  onPagarSenia: () => void;
  onPagarDespues: () => void;
};

export default function ModalPagoTurno({
  turnoCreado,
  cargandoPago,
  errorPago,
  onPagarSenia,
  onPagarDespues,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        <div
          className="border-b border-zinc-800 p-6 flex items-center gap-3"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        >
          <div
            className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">¡Turno Reservado!</h2>
            <p className="text-xs text-zinc-300">Aboná la seña para confirmar tu lugar.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Scissors className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--primary)" }}
              >
                Detalle del pago
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Precio del servicio</span>
              <span className="text-sm text-white font-medium">
                ${turnoCreado.precioCongelado.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">Seña requerida</span>
                <p className="text-xs text-zinc-500 mt-0.5">El resto se abona en el local</p>
              </div>
              <span className="text-2xl font-black" style={{ color: "var(--primary-tinta)" }}>
                ${turnoCreado.seniaCongelada.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {errorPago && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {errorPago}
            </div>
          )}

          <button
            id="btn-pagar-senia"
            onClick={onPagarSenia}
            disabled={cargandoPago}
            className="w-full flex items-center justify-center gap-3 disabled:opacity-50 text-[var(--primary-foreground)] font-black py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider shadow-lg hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {cargandoPago ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando enlace...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pagar Seña · ${turnoCreado.seniaCongelada.toLocaleString("es-AR")}
              </>
            )}
          </button>

          <button
            id="btn-pagar-despues"
            onClick={onPagarDespues}
            disabled={cargandoPago}
            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-medium py-3 rounded-xl transition-all text-sm"
          >
            <Clock className="w-4 h-4" />
            Pagar después (dejar pendiente)
          </button>
        </div>
      </div>
    </div>
  );
}