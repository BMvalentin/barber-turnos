"use client";

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
  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)]">
          Descripción
        </label>
        <span 
          className={`text-[9px] font-bold uppercase`}
          style={{ color: descripcion.length > 450 ? "var(--page-primary-tinta)" : 'var(--admin-texto-muted)' }}
        >
          {descripcion.length} / 500
        </span>
      </div>
      <textarea
        name="descripcion"
        value={descripcion}
        onChange={(e) => onDescripcionChange(e.target.value.slice(0, 500))}
        rows={3}
        className={`w-full bg-[var(--admin-surface-elevated)] border rounded-lg px-4 py-3 text-[var(--admin-texto-primario)] transition-colors duration-150 placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)] resize-none`}
        style={{ 
          borderColor: error ? '#ef4444' : "var(--admin-border)",
        }}
        placeholder="Detalla qué incluye el servicio..."
      />
      {error && (
        <p className="text-[10px] text-red-500 font-medium">{error[0]}</p>
      )}
    </div>
  );
}