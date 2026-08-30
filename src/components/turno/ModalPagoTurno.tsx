"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, CreditCard, Loader2, Scissors, Wallet } from "lucide-react";
import type { TurnoCreado } from "@/types/turno";
import type { TipoPago } from "@/types/mercadopago";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import ModalBase from "@/components/ui/ModalBase";

type Props = {
  turnoCreado: TurnoCreado;
  cargandoPago: boolean;
  errorPago: string | null;
  onPagar: (tipoPago: TipoPago) => void;
  onPagarDespues: () => void;
};

export default function ModalPagoTurno({
  turnoCreado,
  cargandoPago,
  errorPago,
  onPagar,
  onPagarDespues,
}: Props) {
  useEffect(() => {
    if (errorPago) {
      toast.error("Error de pago", { description: errorPago });
    }
  }, [errorPago]);

  const total = turnoCreado.precioCongelado;
  const senia = turnoCreado.seniaCongelada;
  const saldo = Math.max(total - senia, 0);

  return (
    <ModalBase
      maxWidth="max-w-md"
      overlayClase="bg-black/80 backdrop-blur-md p-4"
      contenedorClase="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden"
      header={
        <div
          className="border-b border-zinc-800 p-6 flex items-center gap-3"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        >
          <div
            className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: "var(--primary-tinta)" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">¡Turno Reservado!</h2>
            <p className="text-xs text-zinc-300">Aboná para confirmar tu lugar.</p>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Scissors className="w-4 h-4" style={{ color: "var(--primary-tinta)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--primary-tinta)" }}
              >
                Detalle del pago
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Precio del servicio</span>
              <span className="text-sm text-white font-medium">${formatearMoneda(total)}</span>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
              <span className="text-sm text-zinc-400">Seña (a abonar ya)</span>
              <span className="text-sm text-zinc-200 font-medium">${formatearMoneda(senia)}</span>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
              <span className="text-sm text-zinc-400">Saldo en el local</span>
              <span className="text-sm text-zinc-200 font-medium">${formatearMoneda(saldo)}</span>
            </div>
          </div>

          <button
            id="btn-pagar-senia"
            onClick={() => onPagar("SEÑA")}
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
                Pagar Seña · ${formatearMoneda(senia)}
              </>
            )}
          </button>

          <button
            id="btn-pagar-total"
            onClick={() => onPagar("TOTAL")}
            disabled={cargandoPago}
            className="w-full flex items-center justify-center gap-3 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700"
          >
            <Wallet className="w-5 h-5" />
            Pagar Total · ${formatearMoneda(total)}
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
    </ModalBase>
  );
}