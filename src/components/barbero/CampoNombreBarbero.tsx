"use client";

import { useId } from "react";

type Props = {
  valor: string;
  error: string | null;
  requerido?: boolean;
  onCambio: (valor: string) => void;
};

export default function CampoNombreBarbero({
  valor,
  error,
  requerido = false,
  onCambio,
}: Props) {
  const idCampo = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={idCampo} className="block text-sm font-medium text-[var(--admin-texto-secundario)]">
        Nombre {requerido && <span style={{ color: "var(--page-primary-tinta)" }}>*</span>}
      </label>

      <input
        type="text"
        id={idCampo}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${idCampo}-error` : undefined}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="min-h-11 w-full rounded-xl border bg-[var(--admin-surface-elevated)] px-3 text-base text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] sm:text-sm"
        style={{
          borderColor: error ? "var(--admin-error)" : "var(--admin-border-fuerte)",
        }}
        placeholder="Ingresá el nombre del barbero"
      />

      {error && (
        <p id={`${idCampo}-error`} className="text-sm text-[var(--admin-error)]">{error}</p>
      )}
    </div>
  );
}
