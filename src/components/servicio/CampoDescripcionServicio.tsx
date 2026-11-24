"use client";

import { useId } from "react";

type CampoDescripcionServicioProps = {
  descripcion: string;
  onDescripcionChange: (value: string) => void;
  error?: string[];
};

export default function CampoDescripcionServicio({
  descripcion,
  onDescripcionChange,
  error,
}: CampoDescripcionServicioProps) {
  const idCampo = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={idCampo} className="block text-sm font-medium text-[var(--admin-texto-secundario)]">
          Descripción
        </label>
        <span className="text-xs tabular-nums text-[var(--admin-texto-muted)]">
          {descripcion.length} / 500
        </span>
      </div>
      <textarea
        name="descripcion"
        id={idCampo}
        aria-invalid={Boolean(error?.[0])}
        aria-describedby={error?.[0] ? `${idCampo}-error` : undefined}
        value={descripcion}
        onChange={(e) => onDescripcionChange(e.target.value.slice(0, 500))}
        rows={3}
        className="w-full resize-y rounded-xl border bg-[var(--admin-surface-elevated)] px-3 py-2.5 text-base text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] sm:text-sm"
        style={{
          borderColor: error?.[0] ? "var(--admin-error)" : "var(--admin-border-fuerte)",
        }}
        placeholder="Detalla qué incluye el servicio..."
      />
      {error?.[0] && (
        <p id={`${idCampo}-error`} className="text-sm text-[var(--admin-error)]">{error[0]}</p>
      )}
    </div>
  );
}
