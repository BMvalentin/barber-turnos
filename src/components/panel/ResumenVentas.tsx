import { ChartNoAxesColumnIncreasing, UsersRound } from "lucide-react";
import type { TotalesVentas } from "@/lib/consultas/obtener-ventas-panel";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

type ResumenVentasProps = {
  titulo: string;
  ventas: TotalesVentas;
  ganancia?: number;
};

export function ResumenVentas({ titulo, ventas, ganancia }: ResumenVentasProps) {
  const esPersonal = ganancia !== undefined;
  const Icono = esPersonal ? ChartNoAxesColumnIncreasing : UsersRound;

  return (
    <section className="admin-card @container">
      <div className="flex items-center gap-2.5 px-4 pt-4 sm:px-5">
        <Icono size={18} className="shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />
        <h2 className="text-base font-semibold">{titulo}</h2>
      </div>

      <div className="@min-[38rem]:grid @min-[38rem]:grid-cols-[minmax(13rem,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-w-0 px-4 pt-4 pb-5 sm:px-5">
          <dl>
            <dt className="text-sm font-medium text-[var(--admin-texto-secundario)]">Cobrado</dt>
            <dd className="mt-0.5 text-[1.875rem] leading-tight font-semibold tracking-tight tabular-nums [overflow-wrap:anywhere] sm:text-4xl">
              $ {formatearMoneda(ventas.cobrado / 100)}
            </dd>
          </dl>
          <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
            $ {formatearMoneda(ventas.senas / 100)} en señas
          </p>
        </div>

        <dl className="grid content-center gap-y-3 border-t border-[var(--admin-border)] px-4 py-3.5 sm:px-5 @min-[38rem]:border-t-0">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] items-baseline gap-3">
            <dt className="text-sm text-[var(--admin-texto-secundario)]">Turnos completados</dt>
            <dd className="text-right text-sm font-semibold tabular-nums">{ventas.completados.toLocaleString("es-AR")}</dd>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] items-baseline gap-3">
            <dt className="text-sm text-[var(--admin-texto-secundario)]">Saldo de turnos completados</dt>
            <dd className="text-right text-sm font-semibold tabular-nums [overflow-wrap:anywhere]">$ {formatearMoneda(ventas.saldo / 100)}</dd>
          </div>
          {esPersonal && (
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] items-baseline gap-3">
              <dt className="text-sm text-[var(--admin-texto-secundario)]">Mi comisión estimada</dt>
              <dd className="text-right text-sm font-semibold tabular-nums [overflow-wrap:anywhere]">$ {formatearMoneda(ganancia / 100)}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
