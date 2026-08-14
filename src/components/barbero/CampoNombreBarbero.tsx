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
      <label className="text-sm font-semibold" style={{ color: `var(--page-primary-70)` }}>
        Nombre {requerido && <span style={{ color: "var(--page-primary)" }}>*</span>}
      </label>

      <input
        type="text"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="w-full rounded-lg px-3 py-2 bg-black/65 text-white focus:outline-none transition-colors border"
        style={{
          borderColor: `var(--page-primary-40)`,
        }}
        placeholder="Ingrese el nombre del barbero"
      />

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}