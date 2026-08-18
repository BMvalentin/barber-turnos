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
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
        <p className="text-xs font-medium text-[var(--admin-texto-secundario)] mb-2">
          Servicios Activos
        </p>
        <p
          className="text-3xl font-semibold"
          style={{ color: "var(--page-primary-tinta)" }}
        >
          {serviciosActivos}
        </p>
      </div>
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
        <p className="text-xs font-medium text-[var(--admin-texto-secundario)] mb-2">
          Precio Promedio
        </p>
        <p className="text-3xl font-semibold text-[var(--admin-texto-primario)]">
          ${precioPromedio}
        </p>
      </div>
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
        <p className="text-xs font-medium text-[var(--admin-texto-secundario)] mb-2">
          Tiempo Estimado
        </p>
        <p className="text-3xl font-semibold text-[var(--admin-texto-primario)]">
          {tiempoPromedio} min
        </p>
      </div>
    </div>
  );
}