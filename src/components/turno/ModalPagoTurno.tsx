"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Loader2, Scissors, Wallet } from "lucide-react";
import type { TurnoCreado } from "@/types/turno";
import type { TipoPago } from "@/types/mercadopago";
import type { DatosTransferencia, MetodoPago } from "@/types/pago";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import { esTransferenciaConfigurada } from "@/lib/pagos/es-transferencia-configurada";
import ModalBase from "@/components/ui/ModalBase";
import SelectorMetodoPago from "@/components/turno/SelectorMetodoPago";
import PanelTransferencia from "@/components/turno/PanelTransferencia";

type Props = {
  turnoCreado: TurnoCreado;
  cargandoPago: boolean;
  errorPago: string | null;
  transferenciaLista: boolean;
  datosTransferencia: DatosTransferencia;
  whatsappPhone: string;
  onPagar: (tipoPago: TipoPago, metodoPago: MetodoPago) => void;
  onVolverTransferencia: () => void;
  onClose?: () => void;
};

export default function ModalPagoTurno({
  turnoCreado,
  cargandoPago,
  errorPago,
  transferenciaLista,
  datosTransferencia,
  whatsappPhone,
  onPagar,
  onVolverTransferencia,
  onClose,
}: Props) {
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("MERCADO_PAGO");
  const [tipoPago, setTipoPago] = useState<TipoPago>("SEÑA");

  useEffect(() => {
    if (errorPago) toast.error("Error de pago", { description: errorPago });
  }, [errorPago]);

  const total = turnoCreado.precioCongelado;
  const senia = turnoCreado.seniaCongelada;
  const saldo = Math.max(total - senia, 0);
  const transferenciaDisponible = esTransferenciaConfigurada(datosTransferencia);

  return (
    <ModalBase
      maxWidth="max-w-md"
      overlayClase="bg-black/80 backdrop-blur-md p-4"
      contenedorClase="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl overflow-hidden"
      onClose={onClose}
      header={
        <div
          className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] p-6"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)]"
              style={{ backgroundColor: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
            >
              <CheckCircle2 className="h-5 w-5" style={{ color: "var(--primary-tinta)" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--admin-texto-primario)]">¡Turno reservado!</h2>
              <p className="text-xs text-[var(--admin-texto-secundario)]">Elegí cómo confirmar tu lugar.</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm text-[var(--admin-texto-muted)] transition hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
            >
              Cerrar
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4 p-6">
        {transferenciaLista ? (
          <PanelTransferencia
            turnoCreado={turnoCreado}
            tipoPago={tipoPago}
            datosTransferencia={datosTransferencia}
            whatsappPhone={whatsappPhone}
            onVolver={onVolverTransferencia}
          />
        ) : (
          <>
            <div className="space-y-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-4">
              <div className="mb-1 flex items-center gap-2">
                <Scissors className="h-4 w-4" style={{ color: "var(--primary-tinta)" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary-tinta)" }}>
                  Detalle del pago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--admin-texto-secundario)]">Precio del servicio</span>
                <span className="font-medium text-[var(--admin-texto-primario)]">${formatearMoneda(total)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-3">
                <span className="text-sm text-[var(--admin-texto-secundario)]">Seña</span>
                <span className="font-medium text-[var(--admin-texto-primario)]">${formatearMoneda(senia)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-3">
                <span className="text-sm text-[var(--admin-texto-secundario)]">Saldo en el local</span>
                <span className="font-medium text-[var(--admin-texto-primario)]">${formatearMoneda(saldo)}</span>
              </div>
            </div>

            <SelectorMetodoPago
              valor={metodoPago}
              transferenciaDisponible={transferenciaDisponible}
              onChange={setMetodoPago}
            />

            <fieldset className="space-y-3" aria-label="Importe a pagar">
              <legend className="text-sm font-semibold text-[var(--admin-texto-primario)]">Elegí el importe</legend>
              <div className="grid grid-cols-2 gap-3">
                {(["SEÑA", "TOTAL"] as const).map((opcion) => {
                  const monto = opcion === "TOTAL" ? total : senia;
                  const seleccionado = tipoPago === opcion;
                  return (
                    <button
                      key={opcion}
                      type="button"
                      onClick={() => setTipoPago(opcion)}
                      className={`rounded-xl border p-3 text-left transition-colors ${seleccionado ? "border-[var(--page-primary)] bg-[var(--page-primary-15)]" : "border-[var(--admin-border)] bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)]"}`}
                    >
                      <span className="block text-xs uppercase tracking-wider text-[var(--admin-texto-muted)]">{opcion === "SEÑA" ? "Seña" : "Total"}</span>
                      <span className="mt-1 block font-bold text-[var(--admin-texto-primario)]">${formatearMoneda(monto)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => onPagar(tipoPago, metodoPago)}
              disabled={cargandoPago || (metodoPago === "TRANSFERENCIA" && !transferenciaDisponible)}
              aria-busy={cargandoPago}
              className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-black uppercase tracking-wider text-[var(--primary-foreground)] shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {cargandoPago ? <Loader2 className="h-5 w-5 animate-spin" /> : metodoPago === "MERCADO_PAGO" ? <CreditCard className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
              {cargandoPago ? "Preparando pago..." : metodoPago === "MERCADO_PAGO" ? "Continuar con Mercado Pago" : "Ver datos para transferir"}
            </button>
          </>
        )}
      </div>
    </ModalBase>
  );
}
