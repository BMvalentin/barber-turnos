"use client";

import { CreditCard, Landmark } from "lucide-react";
import type { MetodoPago } from "@/types/pago";

type Props = {
  valor: MetodoPago;
  transferenciaDisponible: boolean;
  onChange: (valor: MetodoPago) => void;
};

export default function SelectorMetodoPago({
  valor,
  transferenciaDisponible,
  onChange,
}: Props) {
  return (
    <fieldset className="space-y-3" aria-label="Método de pago">
      <legend className="text-sm font-semibold text-[var(--admin-texto-primario)]">
        Elegí cómo pagar
      </legend>
      <div className={`grid gap-3 ${transferenciaDisponible ? "sm:grid-cols-2" : ""}`} role="radiogroup">
        <button
          type="button"
          role="radio"
          aria-checked={valor === "MERCADO_PAGO"}
          onClick={() => onChange("MERCADO_PAGO")}
          className={`rounded-xl border p-4 text-left transition-colors ${
            valor === "MERCADO_PAGO"
              ? "border-[var(--page-primary)] bg-[var(--page-primary-15)]"
              : "border-[var(--admin-border)] bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)]"
          }`}
        >
          <span className="flex items-center gap-2 font-semibold text-[var(--admin-texto-primario)]">
            <CreditCard className="h-5 w-5 text-[var(--admin-texto-primario)]" />
            Mercado Pago
          </span>
          <span className="mt-2 block text-xs text-[var(--admin-texto-secundario)]">
            Pagá online y recibí confirmación automática.
          </span>
        </button>

        {transferenciaDisponible && (
          <button
            type="button"
            role="radio"
            aria-checked={valor === "TRANSFERENCIA"}
            onClick={() => onChange("TRANSFERENCIA")}
            className={`rounded-xl border p-4 text-left transition-colors ${
              valor === "TRANSFERENCIA"
                ? "border-[var(--page-primary)] bg-[var(--page-primary-15)]"
                : "border-[var(--admin-border)] bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)]"
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-[var(--admin-texto-primario)]">
              <Landmark className="h-5 w-5 text-[var(--admin-texto-primario)]" />
              Transferencia bancaria
            </span>
            <span className="mt-2 block text-xs text-[var(--admin-texto-secundario)]">
              Transferí y mandá el comprobante por WhatsApp.
            </span>
          </button>
        )}
      </div>
    </fieldset>
  );
}
