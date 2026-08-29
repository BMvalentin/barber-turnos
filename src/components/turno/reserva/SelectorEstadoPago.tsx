"use client";

import type { PropsSelectorEstadoPago } from "@/components/turno/reserva/tipos";
import { ESTADOS_PAGO } from "@/lib/constants";

const ETIQUETAS_ESTADOS: Record<(typeof ESTADOS_PAGO)[number], string> = {
  PENDIENTE: "Pendiente",
  SEÑADO: "Señado",
  PAGADO: "Pagado",
};

export default function SelectorEstadoPago({
  valor,
  onChange,
}: PropsSelectorEstadoPago) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="estado-pago-reserva"
        className="text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]"
      >
        Estado de pago
      </label>
      <select
        id="estado-pago-reserva"
        value={valor}
        onChange={(e) =>
          onChange(e.target.value as (typeof ESTADOS_PAGO)[number])
        }
        className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
      >
        {ESTADOS_PAGO.map((estado) => (
          <option key={estado} value={estado}>
            {ETIQUETAS_ESTADOS[estado]}
          </option>
        ))}
      </select>
    </div>
  );
}
