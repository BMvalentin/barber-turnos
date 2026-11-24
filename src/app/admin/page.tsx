import Link from "next/link";
import { redirect } from "next/navigation";
import { Scissors } from "lucide-react";
import { AgendaResumen } from "@/components/panel/AgendaResumen";
import { DetailCard } from "@/components/panel/DetailCard";
import { DetalleVentasEquipo } from "@/components/panel/DetalleVentasEquipo";
import { ItemLista } from "@/components/panel/ItemLista";
import { ResumenVentas } from "@/components/panel/ResumenVentas";
import { obtenerEstadisticasPanel } from "@/lib/consultas/obtener-estadisticas-panel";
import { leerPeriodoVentas, PERIODOS_VENTAS } from "@/lib/consultas/periodo-ventas-panel";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { formatearFecha } from "@/lib/utils/formatear-fecha";

export default async function AdminDashboard({ searchParams }: {
  searchParams: Promise<{ periodo?: string | string[] }>;
}) {
  const [contexto, { periodo: periodoSolicitado }] = await Promise.all([requerirPanel(), searchParams]);
  if (!contexto) redirect("/dashboard");

  const periodo = leerPeriodoVentas(periodoSolicitado);
  const ahora = new Date();
  const stats = await obtenerEstadisticasPanel(contexto, periodo, ahora);
  if (!stats) redirect("/dashboard");

  const { propio, equipo, agenda, serviciosPopulares } = stats;

  return (
    <div className="admin-pagina @container">
      <header className="admin-encabezado">
        <div>
          <h1>Inicio</h1>
          <p className="first-letter:uppercase">{formatearFecha(ahora)}</p>
        </div>
        <nav aria-label="Período de ventas" className="w-full sm:w-auto">
          <span className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">Período de ventas</span>
          <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.65fr)_minmax(0,1fr)] gap-1 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 sm:grid-cols-[auto_auto_auto]">
            {PERIODOS_VENTAS.map(({ valor, etiqueta }) => (
              <Link
                key={valor}
                href={valor === "hoy" ? "/admin" : `/admin?periodo=${valor}`}
                scroll={false}
                aria-current={periodo === valor ? "true" : undefined}
                className="admin-control border-0 px-1.5 text-[var(--admin-texto-secundario)] aria-[current=true]:bg-[var(--page-primary-soft)] aria-[current=true]:text-[var(--admin-texto-primario)] sm:px-3"
              >
                {etiqueta}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="grid gap-2.5">
        <div className={`grid gap-4 ${propio && equipo ? "@min-[48rem]:grid-cols-2" : ""}`}>
          {propio && <ResumenVentas titulo="Mis ventas" ventas={propio.ventas} ganancia={propio.ganancia} />}
          {equipo && <ResumenVentas titulo={propio ? "Ventas del equipo" : "Ventas de la barbería"} ventas={equipo.ventas} />}
        </div>
        <p className="text-sm text-[var(--admin-texto-muted)]">
          Importes según la fecha del turno y el pago registrado. Se excluyen los turnos cancelados.
        </p>
      </div>

      <div className="grid items-start gap-4 @min-[44rem]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <AgendaResumen {...agenda} personal={Boolean(propio)} />
        <div className="grid min-w-0 gap-4">
          {equipo && <DetalleVentasEquipo key={periodo} empleados={equipo.empleados} />}
          <DetailCard title={propio ? "Mis servicios más reservados" : "Servicios más reservados"} icon={Scissors}>
            {serviciosPopulares.length === 0 ? (
              <p className="py-4 text-sm text-[var(--admin-texto-muted)]">Todavía no hay reservas por servicio.</p>
            ) : (
              <>
                <p className="pt-3 text-sm text-[var(--admin-texto-muted)]">Histórico de reservas</p>
                {serviciosPopulares.map((servicio) => (
                  <ItemLista key={servicio.id}>
                    <p className="line-clamp-2 min-w-0 text-sm font-medium [overflow-wrap:anywhere]">{servicio.nombre}</p>
                    <p className="shrink-0 text-sm tabular-nums text-[var(--admin-texto-muted)]">
                      {servicio.reservas} {servicio.reservas === 1 ? "reserva" : "reservas"}
                    </p>
                  </ItemLista>
                ))}
              </>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
