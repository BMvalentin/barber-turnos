"use client";

import type { PropsSelectorEstadoPago } from "@/components/turno/reserva/tipos";
import { ESTADOS_PAGO, ESTADOS_PAGO_MANUALES } from "@/lib/constants";

type EstadoPago = (typeof ESTADOS_PAGO)[number];

const ETIQUETAS_ESTADOS: Record<EstadoPago, string> = {
  PENDIENTE: "Pendiente",
  SEÑADO: "Señado",
  PAGADO: "Pagado",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  CANCELADO: "Cancelado",
  EN_ACREDITACION: "En acreditación",
};

function esEstadoManual(estado: EstadoPago): boolean {
  return (ESTADOS_PAGO_MANUALES as readonly string[]).includes(estado);
}

export default function SelectorEstadoPago({
  valor,
  onChange,
}: PropsSelectorEstadoPago) {
  /* Los estados que setea Mercado Pago (APROBADO, RECHAZADO, EN_ACREDITACION)
     no se pueden elegir a mano, pero sí deben mostrarse cuando son el valor
     persistido del turno. */
  const opciones: EstadoPago[] = esEstadoManual(valor)
    ? [...ESTADOS_PAGO_MANUALES]
    : [valor, ...ESTADOS_PAGO_MANUALES];

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
        onChange={(e) => onChange(e.target.value as EstadoPago)}
        className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
      >
        {opciones.map((estado) => (
          <option key={estado} value={estado}>
            {ETIQUETAS_ESTADOS[estado]}
          </option>
        ))}
      </select>
    </div>
  );
}
