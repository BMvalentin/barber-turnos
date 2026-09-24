// app/admin/page.tsx
import {
  Users,
  Scissors,
  Calendar,
  DollarSign,
} from "lucide-react";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { StatCard } from "@/components/panel/StatCard";
import { DetailCard } from "@/components/panel/DetailCard";
import { ItemLista } from "@/components/panel/ItemLista";
import PanelResumenEmpleado from "@/components/panel/PanelResumenEmpleado";
import { ESTADOS_TURNO } from "@/lib/constants";
import { obtenerEstadisticasPanel } from "@/lib/consultas/obtener-estadisticas-panel";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");
  const esEmpleado = contexto.rol === "EMPLEADO";
  const stats = await obtenerEstadisticasPanel(esEmpleado ? contexto.barberoId ?? undefined : undefined);

  if (esEmpleado) {
    return <PanelResumenEmpleado stats={stats} />;
  }

  return (
    <div className="space-y-8">
      {/* ENCABEZADO */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px] text-[var(--admin-texto-primario)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Resumen general de tu barbería.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Barberos"
          value={stats.totalBarberos}
          icon={Users}
          href="/admin/barbero"
        />
        <StatCard
          title="Servicios"
          value={stats.totalServicios}
          icon={Scissors}
          href="/admin/servicio"
        />
        <StatCard
          title="Total Turnos"
          value={stats.totalTurnos}
          icon={Calendar}
          href="/admin/turno"
        />
        <StatCard
          title="Turnos activos"
          value={stats.turnosPendientes}
          icon={DollarSign}
          href="/admin/turno?filtro=activos"
        />
      </div>

      {/* DETALLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailCard title="Barberos" icon={Users}>
          {stats.barberos.length === 0 ? (
            <Empty text="No hay barberos" />
          ) : (
            stats.barberos.map((b) => (
              <ItemLista key={b.id}>
                <p className="text-sm text-[var(--admin-texto-primario)]">
                  {b.nombre}
                </p>
                <p className="text-xs text-[var(--admin-texto-muted)]">
                  {b._count.turnos} activos
                </p>
              </ItemLista>
            ))
          )}
        </DetailCard>

        <DetailCard title="Servicios" icon={Scissors}>
          {stats.serviciosPopulares.length === 0 ? (
            <Empty text="No hay servicios" />
          ) : (
            stats.serviciosPopulares.map((s) => (
              <ItemLista key={s.id}>
                <p className="text-sm text-[var(--admin-texto-primario)]">
                  {s.nombre}
                </p>
                <p className="text-xs text-[var(--admin-texto-muted)]">
                  {s._count.turnos} usos
                </p>
              </ItemLista>
            ))
          )}
        </DetailCard>

        <DetailCard title="Rendimiento Hoy" icon={DollarSign}>
          {stats.rendimientoHoyPorBarbero.length === 0 ? (
            <Empty text="No hay barberos" />
          ) : (
            stats.rendimientoHoyPorBarbero.map((b) => {
              const completados = b.turnos.length;
              const recaudado = b.turnos.reduce(
                (acc, t) => acc + Number(t.precioCongelado),
                0,
              );
              const comision = recaudado * 0.5; // Asumiendo un 50% de comisión
              return (
                <ItemLista key={b.id}>
                  <div>
                    <p className="text-sm text-[var(--admin-texto-primario)]">
                      {b.nombre}
                    </p>
                    <p className="text-xs text-[var(--admin-texto-muted)]">
                      {completados} cortes completados
                    </p>
                  </div>
                  {completados > 0 && (
                    <div className="mt-1 pt-1 border-t border-[var(--admin-border)] flex flex-col items-end text-right">
                      <span className="text-[var(--page-primary-tinta)] text-xs">
                        Total: ${recaudado.toFixed(2)}
                      </span>
                      <span className="text-green-500/80 text-xs">
                        Comisión (50%): ${comision.toFixed(2)}
                      </span>
                    </div>
                  )}
                </ItemLista>
              );
            })
          )}
        </DetailCard>
      </div>

      {/* AGENDA */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-texto-primario)]">
          Agenda de Hoy
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stats.turnosHoyPorBarbero
            .filter((b) => b.turnos.length > 0)
            .map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5"
              >
                <h3 className="text-sm font-semibold text-[var(--admin-texto-primario)] mb-3">
                  {b.nombre}
                </h3>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {b.turnos.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg bg-[var(--admin-surface-elevated)] p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm text-[var(--admin-texto-primario)]">
                          {t.user?.name ||
                            t.user?.email ||
                            "Usuario eliminado"}
                        </p>
                        <p className="text-xs text-[var(--admin-texto-muted)]">
                          {t.servicio?.nombre || "Servicio eliminado"}
                        </p>
                        <p className="text-xs text-[var(--admin-texto-muted)]">
                          {formatearHora(t.horarioReservado)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.estado === ESTADOS_TURNO[1]
                            ? "bg-green-500/20 text-green-500 border border-green-500/30"
                            : "bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]"
                        }`}
                      >
                        {t.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="text-center text-[var(--admin-texto-muted)] py-6 text-sm">
      {text}
    </p>
  );
}
