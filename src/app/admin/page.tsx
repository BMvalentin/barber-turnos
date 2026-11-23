import { CalendarDays, ChartNoAxesColumnIncreasing, Clock3, Scissors, UsersRound } from "lucide-react";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import { StatCard } from "@/components/panel/StatCard";
import { DetailCard } from "@/components/panel/DetailCard";
import { ItemLista } from "@/components/panel/ItemLista";
import { AgendaResumen } from "@/components/panel/AgendaResumen";
import PanelResumenEmpleado from "@/components/panel/PanelResumenEmpleado";
import { obtenerEstadisticasPanel } from "@/lib/consultas/obtener-estadisticas-panel";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");
  const esEmpleado = contexto.rol === "EMPLEADO";
  const stats = await obtenerEstadisticasPanel(
    esEmpleado ? (contexto.barberoId ?? undefined) : undefined,
  );

  if (esEmpleado) {
    return <PanelResumenEmpleado stats={stats} />;
  }

  return (
    <div className="admin-pagina">
      <header className="admin-encabezado">
        <div>
          <h1>Resumen</h1>
          <p>Consultá los turnos y la actividad de tu barbería.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatCard title="Empleados activos" value={stats.totalBarberos} icon={UsersRound} href="/admin/barbero" />
        <StatCard title="Servicios activos" value={stats.totalServicios} icon={Scissors} href="/admin/servicio" />
        <StatCard title="Turnos registrados" value={stats.totalTurnos} icon={CalendarDays} href="/admin/turno" />
        <StatCard title="Turnos activos" value={stats.turnosPendientes} icon={Clock3} href="/admin/turno?filtro=activos" />
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <AgendaResumen grupos={stats.turnosHoyPorBarbero.filter((barbero) => barbero.turnos.length > 0)} />
        <DetailCard title="Rendimiento de hoy" icon={ChartNoAxesColumnIncreasing}>
          {stats.rendimientoHoyPorBarbero.length === 0 ? (
            <VacioResumen>No hay empleados activos.</VacioResumen>
          ) : (
            stats.rendimientoHoyPorBarbero.map((barbero) => (
              <ItemLista key={barbero.id}>
                <div className="min-w-0">
                  <p className="text-sm font-medium [overflow-wrap:anywhere]">{barbero.nombre}</p>
                  <p className="text-xs text-[var(--admin-texto-muted)]">
                    {barbero.completados} {barbero.completados === 1 ? "corte completado" : "cortes completados"}
                  </p>
                </div>
                {barbero.completados > 0 && (
                  <span className="shrink-0 text-sm font-medium text-[var(--admin-exito)] tabular-nums">
                    ${formatearMoneda(barbero.ganancia)}
                  </span>
                )}
              </ItemLista>
            ))
          )}
        </DetailCard>
      </div>

      <div className="grid items-start gap-3 md:grid-cols-2">
        <DetailCard title="Empleados" icon={UsersRound}>
          {stats.barberos.length === 0 ? (
            <VacioResumen>No hay empleados activos.</VacioResumen>
          ) : (
            stats.barberos.map((barbero) => (
              <ItemLista key={barbero.id}>
                <p className="text-sm [overflow-wrap:anywhere]">{barbero.nombre}</p>
                <p className="shrink-0 text-xs text-[var(--admin-texto-muted)] tabular-nums">
                  {barbero._count.turnos} {barbero._count.turnos === 1 ? "turno activo" : "turnos activos"}
                </p>
              </ItemLista>
            ))
          )}
        </DetailCard>
        <DetailCard title="Servicios más reservados" icon={Scissors}>
          {stats.serviciosPopulares.length === 0 ? (
            <VacioResumen>No hay reservas por servicio.</VacioResumen>
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
    </div>
  );
}

function VacioResumen({ children }: { children: string }) {
  return <p className="py-5 text-sm text-[var(--admin-texto-muted)]">{children}</p>;
}
