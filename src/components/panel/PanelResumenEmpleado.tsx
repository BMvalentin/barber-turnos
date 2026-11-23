import { CalendarDays, ChartNoAxesColumnIncreasing, Clock3, Scissors } from "lucide-react";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import type { GananciaEmpleado } from "@/lib/ganancias/calcular-ganancia-empleado";
import { DetailCard } from "@/components/panel/DetailCard";
import { ItemLista } from "@/components/panel/ItemLista";
import { StatCard } from "@/components/panel/StatCard";
import { AgendaResumen, type TurnoAgendaResumen } from "@/components/panel/AgendaResumen";

type DatosResumenEmpleado = {
  totalServicios: number;
  totalTurnos: number;
  turnosPendientes: number;
  serviciosPopulares: Array<{
    id: string;
    nombre: string;
    _count: { turnos: number };
  }>;
  turnosHoyPorBarbero: Array<{ turnos: TurnoAgendaResumen[] }>;
  rendimientoHoyPorBarbero: GananciaEmpleado[];
};

export default function PanelResumenEmpleado({ stats }: { stats: DatosResumenEmpleado }) {
  const rendimiento = stats.rendimientoHoyPorBarbero[0];
  const turnosHoy = stats.turnosHoyPorBarbero[0]?.turnos ?? [];
  const completados = rendimiento?.completados ?? 0;

  return (
    <div className="admin-pagina">
      <header className="admin-encabezado">
        <div>
          <h1>Mi resumen</h1>
          <p>Consultá tu agenda y el rendimiento de hoy.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <StatCard title="Servicios ofrecidos" value={stats.totalServicios} icon={Scissors} href="/admin/servicio" />
        <StatCard title="Turnos registrados" value={stats.totalTurnos} icon={CalendarDays} href="/admin/turno" />
        <StatCard title="Turnos activos" value={stats.turnosPendientes} icon={Clock3} href="/admin/turno?filtro=activos" />
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <AgendaResumen grupos={turnosHoy.length ? [{ id: "propios", turnos: turnosHoy }] : []} />
        <DetailCard title="Mi rendimiento de hoy" icon={ChartNoAxesColumnIncreasing}>
          <ItemLista>
            <p className="text-sm font-medium">
              {completados} {completados === 1 ? "corte completado" : "cortes completados"}
            </p>
          </ItemLista>
          {rendimiento && completados > 0 && (
            <>
              <ItemLista>
                <p className="text-sm">Recaudado</p>
                <span className="text-sm font-medium tabular-nums">${formatearMoneda(rendimiento.recaudado)}</span>
              </ItemLista>
              <ItemLista>
                <p className="text-sm">Tu ganancia ({rendimiento.porcentajeGanancia}%)</p>
                <span className="text-sm font-medium text-[var(--admin-exito)] tabular-nums">${formatearMoneda(rendimiento.ganancia)}</span>
              </ItemLista>
            </>
          )}
        </DetailCard>
      </div>

      <DetailCard title="Mis servicios más reservados" icon={Scissors}>
        {stats.serviciosPopulares.length === 0 ? (
          <p className="py-5 text-sm text-[var(--admin-texto-muted)]">Todavía no hay reservas por servicio.</p>
        ) : (
          stats.serviciosPopulares.map((servicio) => (
            <ItemLista key={servicio.id}>
              <p className="text-sm [overflow-wrap:anywhere]">{servicio.nombre}</p>
              <p className="shrink-0 text-xs text-[var(--admin-texto-muted)] tabular-nums">
                {servicio._count.turnos} {servicio._count.turnos === 1 ? "reserva" : "reservas"}
              </p>
            </ItemLista>
          ))
        )}
      </DetailCard>
    </div>
  );
}
