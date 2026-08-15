"use client";

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
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold" style={{ color: `var(--page-primary-tinta)` }}>
        Nombre {requerido && <span style={{ color: "var(--page-primary-tinta)" }}>*</span>}
      </label>

      <input
        type="text"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="w-full rounded-lg bg-[var(--admin-surface-elevated)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] transition-colors duration-150 border focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]"
        style={{
          borderColor: "var(--admin-border)",
        }}
        placeholder="Ingrese el nombre del barbero"
      />

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}