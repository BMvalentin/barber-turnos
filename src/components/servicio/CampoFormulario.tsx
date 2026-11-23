"use client";

import { useId } from "react";

interface CampoFormularioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
  errors?: string[];
  unit?: string;
}

export default function CampoFormulario({
  label,
  icon: Icon,
  unit,
  errors,
  required,
  id,
  ...props
}: CampoFormularioProps) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const error = errors?.[0];

  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={idCampo} className="block text-sm font-medium text-[var(--admin-texto-secundario)]">
        {label} {required && <span style={{ color: "var(--page-primary-tinta)" }}>*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-texto-muted)]" />
        )}
        <input
          {...props}
          id={idCampo}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${idCampo}-error` : undefined}
          className={`min-h-11 w-full rounded-xl border bg-[var(--admin-surface-elevated)] ${Icon ? "pl-9" : "pl-3"} ${unit ? "pr-12" : "pr-3"} text-base text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] sm:text-sm`}
          style={{
            borderColor: error ? "var(--admin-error)" : "var(--admin-border-fuerte)",
          }}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--admin-texto-muted)] uppercase">
            {unit}
          </span>
        )}
      </div>
      {error && <p id={`${idCampo}-error`} className="text-sm text-[var(--admin-error)]">{error}</p>}
    </div>
  );
}
