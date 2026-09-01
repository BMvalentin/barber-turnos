"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Loader2, Scissors, Wallet } from "lucide-react";
import type { TurnoCreado } from "@/types/turno";
import type { TipoPago } from "@/types/mercadopago";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import ModalBase from "@/components/ui/ModalBase";

type Props = {
  turnoCreado: TurnoCreado;
  cargandoPago: boolean;
  errorPago: string | null;
  onPagar: (tipoPago: TipoPago) => void;
};

export default function ModalPagoTurno({
  turnoCreado,
  cargandoPago,
  errorPago,
  onPagar,
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
      contenedorClase="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl overflow-hidden"
      header={
        <div
          className="border-b border-[var(--admin-border)] p-6 flex items-center gap-3"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        >
          <div
            className="w-10 h-10 rounded-full border border-[var(--admin-border)] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: "var(--primary-tinta)" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--admin-texto-primario)]">¡Turno Reservado!</h2>
            <p className="text-xs text-[var(--admin-texto-secundario)]">Aboná para confirmar tu lugar.</p>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-4">
          <div className="bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl p-4 space-y-3">
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
              <span className="text-sm text-[var(--admin-texto-secundario)]">Precio del servicio</span>
              <span className="text-sm text-[var(--admin-texto-primario)] font-medium">${formatearMoneda(total)}</span>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-3">
              <span className="text-sm text-[var(--admin-texto-secundario)]">Seña (a abonar ya)</span>
              <span className="text-sm text-[var(--admin-texto-primario)] font-medium">${formatearMoneda(senia)}</span>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-3">
              <span className="text-sm text-[var(--admin-texto-secundario)]">Saldo en el local</span>
              <span className="text-sm text-[var(--admin-texto-primario)] font-medium">${formatearMoneda(saldo)}</span>
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
            className="w-full flex items-center justify-center gap-3 disabled:opacity-50 text-[var(--admin-texto-primario)] font-black py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)]"
          >
            <Wallet className="w-5 h-5" />
            Pagar Total · ${formatearMoneda(total)}
          </button>
        </div>
    </ModalBase>
  );
}
