import { Clock3, Scissors, Wallet } from "lucide-react";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

type ServicioStatsProps = {
  serviciosActivos: number;
  precioPromedio: string;
  tiempoPromedio: number;
};

export default function ServicioStats({ serviciosActivos, precioPromedio, tiempoPromedio }: ServicioStatsProps) {
  const indicadores = [
    { etiqueta: "Servicios activos", valor: serviciosActivos, Icono: Scissors },
    { etiqueta: "Precio promedio", valor: `$${formatearMoneda(Number(precioPromedio))}`, Icono: Wallet },
    { etiqueta: "Duración promedio", valor: `${tiempoPromedio} min`, Icono: Clock3 },
  ];

  return (
    <dl aria-label="Resumen del catálogo" className="admin-card grid grid-cols-3 divide-x divide-[var(--admin-border)]">
      {indicadores.map(({ etiqueta, valor, Icono }) => (
        <div key={etiqueta} className="min-w-0 px-2.5 py-3 sm:px-5 sm:py-4">
          <dt className="flex items-center gap-2 text-xs font-medium text-[var(--admin-texto-muted)] sm:text-sm">
            <Icono aria-hidden="true" className="hidden size-4 shrink-0 text-[var(--page-primary-tinta)] sm:block" />
            {etiqueta}
          </dt>
          <dd className="mt-1 text-base font-semibold tabular-nums [overflow-wrap:anywhere] sm:text-2xl">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
