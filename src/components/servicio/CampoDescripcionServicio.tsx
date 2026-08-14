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
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider">
          Descripción
        </label>
        <span 
          className={`text-[9px] font-bold uppercase`}
          style={{ color: descripcion.length > 450 ? "var(--page-primary)" : '#8E8675' }}
        >
          {descripcion.length} / 500
        </span>
      </div>
      <textarea
        name="descripcion"
        value={descripcion}
        onChange={(e) => onDescripcionChange(e.target.value.slice(0, 500))}
        rows={3}
        className={`w-full bg-black/70 border rounded-lg px-4 py-3 text-[#E4E0D9] outline-none transition-colors resize-none`}
        style={{ 
          borderColor: error ? '#ef4444' : "var(--page-secondary)",
        }}
        placeholder="Detalla qué incluye el servicio..."
      />
      {error && (
        <p className="text-[10px] text-red-500 font-medium">{error[0]}</p>
      )}
    </div>
  );
}