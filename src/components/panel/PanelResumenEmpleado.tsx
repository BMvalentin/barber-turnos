import { Calendar, DollarSign, Scissors } from "lucide-react";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { ESTADOS_TURNO } from "@/lib/constants";
import { DetailCard } from "@/components/panel/DetailCard";
import { ItemLista } from "@/components/panel/ItemLista";
import { StatCard } from "@/components/panel/StatCard";

type TurnoAgendaEmpleado = {
  id: string;
  estado: string;
  horarioReservado: Date;
  user: { name: string | null; email: string | null } | null;
  servicio: { nombre: string } | null;
};

export type DatosResumenEmpleado = {
  totalServicios: number;
  totalTurnos: number;
  turnosPendientes: number;
  serviciosPopulares: Array<{
    id: string;
    nombre: string;
    _count: { turnos: number };
  }>;
  turnosHoyPorBarbero: Array<{ turnos: TurnoAgendaEmpleado[] }>;
  rendimientoHoyPorBarbero: Array<{
    turnos: Array<{ precioCongelado: unknown }>;
  }>;
};

export default function PanelResumenEmpleado({ stats }: { stats: DatosResumenEmpleado }) {
  const rendimiento = stats.rendimientoHoyPorBarbero[0];
  const turnosHoy = stats.turnosHoyPorBarbero[0]?.turnos ?? [];
  const completados = rendimiento?.turnos.length ?? 0;
  const recaudado = rendimiento?.turnos.reduce(
    (acumulado, turno) => acumulado + Number(turno.precioCongelado),
    0,
  ) ?? 0;
  const comision = recaudado * 0.5;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
          Mi resumen
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Resumen de tu agenda y desempeño.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Servicios ofrecidos" value={stats.totalServicios} icon={Scissors} href="/admin/barbero" />
        <StatCard title="Turnos registrados" value={stats.totalTurnos} icon={Calendar} href="/admin/turno" />
        <StatCard title="Turnos activos" value={stats.turnosPendientes} icon={DollarSign} href="/admin/turno" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DetailCard title="Mis servicios" icon={Scissors}>
          {stats.serviciosPopulares.length === 0 ? (
            <Empty text="Todavía no tenés turnos registrados por servicio." />
          ) : (
            stats.serviciosPopulares.map((servicio) => (
              <ItemLista key={servicio.id}>
                <p className="text-sm text-[var(--admin-texto-primario)]">{servicio.nombre}</p>
                <p className="text-xs text-[var(--admin-texto-muted)]">
                  {servicio._count.turnos} {servicio._count.turnos === 1 ? "turno" : "turnos"}
                </p>
              </ItemLista>
            ))
          )}
        </DetailCard>

        <DetailCard title="Mi rendimiento de hoy" icon={DollarSign}>
          {!rendimiento ? (
            <Empty text="Todavía no hay actividad para hoy." />
          ) : (
            <ItemLista>
              <div>
                <p className="text-sm text-[var(--admin-texto-primario)]">
                  {completados} {completados === 1 ? "corte completado" : "cortes completados"}
                </p>
                <p className="text-xs text-[var(--admin-texto-muted)]">Total del día</p>
              </div>
              {completados > 0 && (
                <div className="mt-1 flex flex-col items-end border-t border-[var(--admin-border)] pt-1 text-right">
                  <span className="text-xs text-[var(--page-primary-tinta)]">Total: ${recaudado.toFixed(2)}</span>
                  <span className="text-xs text-green-500/80">Comisión (50%): ${comision.toFixed(2)}</span>
                </div>
              )}
            </ItemLista>
          )}
        </DetailCard>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-texto-primario)]">Mi agenda de hoy</h2>
          <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">Tus próximos turnos confirmados.</p>
        </div>

        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
          {turnosHoy.length === 0 ? (
            <Empty text="No tenés turnos programados para hoy." />
          ) : (
            <div className="space-y-2">
              {turnosHoy.map((turno) => (
                <div key={turno.id} className="flex items-center justify-between gap-4 rounded-lg bg-[var(--admin-surface-elevated)] p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[var(--admin-texto-primario)]">
                      {turno.user?.name || turno.user?.email || "Usuario eliminado"}
                    </p>
                    <p className="truncate text-xs text-[var(--admin-texto-muted)]">
                      {turno.servicio?.nombre || "Servicio eliminado"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--admin-texto-primario)]">
                      {formatearHora(turno.horarioReservado)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        turno.estado === ESTADOS_TURNO[1]
                          ? "border border-green-500/30 bg-green-500/20 text-green-500"
                          : "bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]"
                      }`}
                    >
                      {turno.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-[var(--admin-texto-muted)]">{text}</p>;
}
