"use client";

type Props = {
  valor: string;
  error: string | null;
  onCambio: (valor: string) => void;
};

export default function CampoPorcentajeGanancia({ valor, error, onCambio }: Props) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="porcentaje-ganancia"
        className="text-sm font-semibold"
        style={{ color: `var(--page-primary-tinta)` }}
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
          aria-describedby="porcentaje-ganancia-ayuda"
          className="w-full rounded-lg bg-[var(--admin-surface-elevated)] px-3 py-2.5 pr-9 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] transition-colors duration-150 border focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]"
          style={{
            borderColor: "var(--admin-border)",
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
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
