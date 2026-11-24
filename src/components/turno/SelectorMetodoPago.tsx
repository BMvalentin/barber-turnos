"use client";

import { Check, CreditCard, Landmark } from "lucide-react";
import { useId } from "react";
import type { MetodoPago } from "@/types/pago";
import { cn } from "@/lib/utils/cn";

type Props = {
  valor: MetodoPago;
  transferenciaDisponible: boolean;
  onChange: (valor: MetodoPago) => void;
  vistaAdministrativa?: boolean;
};

const METODOS = [
  { id: "MERCADO_PAGO", etiqueta: "Mercado Pago", descripcion: "Pagá online y recibí confirmación automática.", Icono: CreditCard },
  { id: "TRANSFERENCIA", etiqueta: "Transferencia bancaria", descripcion: "Transferí y mandá el comprobante por WhatsApp.", Icono: Landmark },
] as const;

export default function SelectorMetodoPago({
  valor,
  transferenciaDisponible,
  onChange,
  vistaAdministrativa = false,
}: Props) {
  const grupo = useId();

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-[var(--admin-texto-primario)]">
        Elegí cómo pagar
      </legend>
      <div className={cn("grid gap-2 sm:gap-3", transferenciaDisponible && "sm:grid-cols-2")}>
        {METODOS.map(({ id, etiqueta, descripcion, Icono }) => {
          if (id === "TRANSFERENCIA" && !transferenciaDisponible) return null;
          const seleccionado = valor === id;
          const resaltar = seleccionado && !vistaAdministrativa;

          return (
            <label
              key={id}
              className={cn(
                "cursor-pointer border text-left transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[var(--page-focus-ring)]",
                vistaAdministrativa ? "rounded-xl p-4" : "rounded-lg p-3",
                seleccionado
                  ? vistaAdministrativa ? "border-[var(--page-primary)] bg-[var(--page-primary-15)]" : "border-[var(--admin-border-fuerte)] bg-[var(--tema-primario-suave)]"
                  : "border-[var(--admin-border)] bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)]",
              )}
            >
              <input type="radio" name={grupo} value={id} checked={seleccionado} onChange={() => onChange(id)} className="sr-only" />
              <span className={cn("flex items-center gap-2 text-sm font-semibold", resaltar ? "text-[var(--tema-primario-suave-texto)]" : "text-[var(--admin-texto-primario)]")}>
                <Icono className="size-4 shrink-0" aria-hidden="true" />
                <span>{etiqueta}</span>
                {resaltar && <Check className="ml-auto size-4 shrink-0" aria-hidden="true" />}
              </span>
              <span className={cn("mt-1.5 block text-xs", resaltar ? "text-[var(--tema-primario-suave-texto)]" : "text-[var(--admin-texto-secundario)]")}>
                {descripcion}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
