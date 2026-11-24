"use client";

type Props = {
  valor: string;
  error: string | null;
  onCambio: (valor: string) => void;
};

export default function CampoPorcentajeGanancia({ valor, error, onCambio }: Props) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="porcentaje-ganancia"
        className="block text-sm font-medium text-[var(--admin-texto-secundario)]"
      >
        Porcentaje de ganancia por corte
      </label>

      <div className="relative">
        <input
          id="porcentaje-ganancia"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.01}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "porcentaje-ganancia-ayuda porcentaje-ganancia-error" : "porcentaje-ganancia-ayuda"}
          className="min-h-11 w-full rounded-xl border bg-[var(--admin-surface-elevated)] px-3 pr-9 text-base text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] sm:text-sm"
          style={{
            borderColor: error ? "var(--admin-error)" : "var(--admin-border-fuerte)",
          }}
          placeholder="0"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[var(--admin-texto-muted)]"
        >
          %
        </span>
      </div>

      <p id="porcentaje-ganancia-ayuda" className="text-xs text-[var(--admin-texto-muted)]">
        Parte del precio de cada corte que le corresponde al empleado (0 a 100).
      </p>

      {error && (
        <p id="porcentaje-ganancia-error" className="text-sm text-[var(--admin-error)]">{error}</p>
      )}
    </div>
  );
}
