// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";
import {
  Users,
  Scissors,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { StatCard } from "@/components/panel/StatCard";
import { DetailCard } from "@/components/panel/DetailCard";
import { ItemLista } from "@/components/panel/ItemLista";
import { ESTADOS_TURNO_ACTIVOS, ESTADOS_TURNO } from "@/lib/constants";
import { obtenerBarberosConConteoDeTurnos } from "@/lib/consultas/obtener-barberos-con-conteo-de-turnos";
import { obtenerBarberosConTurnosHoy } from "@/lib/consultas/obtener-barberos-con-turnos-hoy";
import { obtenerBarberosConRendimientoHoy } from "@/lib/consultas/obtener-barberos-con-rendimiento-hoy";
import { obtenerServiciosPopulares } from "@/lib/consultas/obtener-servicios-populares";

async function getStats() {
  const hoy = new Date();
  const inicioDia = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    0,
    0,
    0,
  );
  const finDia = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    23,
    59,
    59,
  );
  const claveDia = `${hoy.getFullYear()}-${String(
    hoy.getMonth() + 1,
  ).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  const [
    totalBarberos,
    totalServicios,
    totalTurnos,
    turnosPendientes,
    barberos,
    serviciosPopulares,
    turnosHoyPorBarbero,
    rendimientoHoyPorBarbero,
  ] = await Promise.all([
    getCachedData(
      ["admin-dashboard-total-barberos"],
      ["admin-dashboard"],
      () => prisma.barbero.count({ where: { estado: true } }),
      30,
    ),
    getCachedData(
      ["admin-dashboard-total-servicios"],
      ["admin-dashboard"],
      () => prisma.servicio.count({ where: { estado: true } }),
      30,
    ),
    getCachedData(
      ["admin-dashboard-total-turnos"],
      ["admin-dashboard"],
      () => prisma.turno.count(),
      30,
    ),
    getCachedData(
      ["admin-dashboard-turnos-pendientes"],
      ["admin-dashboard"],
      () =>
        prisma.turno.count({
          where: { estado: { in: [...ESTADOS_TURNO_ACTIVOS] } },
        }),
      30,
    ),
    getCachedData(
      ["admin-dashboard-barberos"],
      ["admin-dashboard"],
      () => obtenerBarberosConConteoDeTurnos(),
      30,
    ),
    getCachedData(
      ["admin-dashboard-servicios-populares"],
      ["admin-dashboard"],
      () => obtenerServiciosPopulares(),
      30,
    ),
    getCachedData(
      ["admin-dashboard-turnos-hoy-por-barbero", claveDia],
      ["admin-dashboard"],
      () => obtenerBarberosConTurnosHoy(inicioDia, finDia),
      30,
    ),
    getCachedData(
      ["admin-dashboard-rendimiento-hoy-por-barbero", claveDia],
      ["admin-dashboard"],
      () => obtenerBarberosConRendimientoHoy(inicioDia, finDia),
      30,
    ),
  ]);

  return {
    totalBarberos,
    totalServicios,
    totalTurnos,
    turnosPendientes,
    barberos,
    serviciosPopulares,
    turnosHoyPorBarbero,
    rendimientoHoyPorBarbero,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-10 mt-10">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            href="/turno"
          />
          <StatCard
            title="Turnos activos"
            value={stats.turnosPendientes}
            icon={DollarSign}
            href="/turno?filtro=activos"
          />
        </div>

        {/* DETALLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailCard title="Barberos" icon={Users}>
            {stats.barberos.length === 0 ? (
              <Empty text="No hay barberos" />
            ) : (
              stats.barberos.map((b) => (
                <ItemLista key={b.id}>
                  <p className="text-white text-sm">{b.nombre}</p>
                  <p className="text-amber-200/60 text-xs">
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
                  <p className="text-white text-sm">{s.nombre}</p>
                  <p className="text-amber-200/60 text-xs">
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
                    <p className="text-white text-sm">{b.nombre}</p>
                    <p className="text-amber-200/60 text-xs">
                      {completados} cortes completados
                    </p>
                    {completados > 0 && (
                      <div className="mt-1 pt-1 border-t border-amber-900/50 flex justify-between">
                        <span className="text-[var(--page-primary)]/80 text-xs">
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
          <div className="flex items-center gap-2">
            <Clock className="text-[var(--page-primary)]" />
            <h2 className="text-2xl font-bold text-white">Agenda de Hoy</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.turnosHoyPorBarbero
              .filter((b) => b.turnos.length > 0)
              .map((b) => (
                <div
                  key={b.id}
                  className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-5"
                >
                  <h3 className="text-white font-bold mb-3">{b.nombre}</h3>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {b.turnos.map((t) => (
                      <div
                        key={t.id}
                        className="bg-black/60 border border-amber-900/30 p-3 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="text-white text-sm">
                            {t.user?.name ||
                              t.user?.email ||
                              "Usuario eliminado"}
                          </p>
                          <p className="text-amber-200/60 text-xs">
                            {t.servicio?.nombre || "Servicio eliminado"}
                          </p>
                          <p className="text-amber-200/60 text-xs">
                            {formatearHora(t.horarioReservado)}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            t.estado === ESTADOS_TURNO[1]
                              ? "bg-green-500/20 text-green-500 border-green-500/30"
                              : "bg-[var(--page-primary)]/20 text-[var(--page-primary)] border-[var(--page-primary)]/30"
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
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-center text-amber-200/50 py-6 text-sm">{text}</p>;
}
