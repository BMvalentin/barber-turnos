"use client";

type ServicioStatsProps = {
  serviciosActivos: number;
  precioPromedio: string;
  tiempoPromedio: number;
};

export default function ServicioStats({
  serviciosActivos,
  precioPromedio,
  tiempoPromedio,
}: ServicioStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-black/70 border border-[#2C261D] rounded-xl p-5">
        <p className="text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
          Servicios Activos
        </p>
        <p
          className="text-3xl font-semibold"
          style={{ color: "var(--page-primary)" }}
        >
          {serviciosActivos}
        </p>
      </div>
      <div className="bg-black/70 border border-[#2C261D] rounded-xl p-5">
        <p className="text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
          Precio Promedio
        </p>
        <p className="text-3xl font-semibold text-[#E4E0D9]">
          ${precioPromedio}
        </p>
      </div>
      <div className="bg-black/70 border border-[#2C261D] rounded-xl p-5">
        <p className="text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
          Tiempo Estimado
        </p>
        <p className="text-3xl font-semibold text-[#E4E0D9]">
          {tiempoPromedio} min
        </p>
      </div>
    </div>
  );
}