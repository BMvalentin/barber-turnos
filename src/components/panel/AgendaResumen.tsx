import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import BadgeEstadoTurno from "@/components/turno/gestion/BadgeEstadoTurno";
import { formatearHora } from "@/lib/utils/formatear-hora";

type TurnoAgendaResumen = {
  id: string;
  estado: string;
  horarioReservado: Date | string;
  clienteNombre: string | null;
  clienteApellido: string | null;
  user: { name: string | null } | null;
  servicio: { nombre: string } | null;
  barbero: { nombre: string } | null;
};

type AgendaResumenProps = {
  turnos: TurnoAgendaResumen[];
  total: number;
  personal: boolean;
};

export function AgendaResumen({ turnos, total, personal }: AgendaResumenProps) {
  return (
    <section className="admin-card @container">
      <div className="flex items-center gap-2.5 border-b border-[var(--admin-border)] px-4 py-3.5 sm:px-5">
        <CalendarDays className="size-[17px] shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />
        <h2 className="text-base font-semibold">{personal ? "Mi agenda de hoy" : "Agenda de hoy"}</h2>
      </div>

      {turnos.length === 0 ? (
        <p className="px-4 py-4 text-sm text-[var(--admin-texto-muted)] sm:px-5">No hay turnos activos para hoy.</p>
      ) : (
        <ul className="divide-y divide-[var(--admin-border)] px-4 sm:px-5">
          {turnos.map((turno) => {
            const cliente = turno.clienteNombre
              ? [turno.clienteNombre, turno.clienteApellido].filter(Boolean).join(" ")
              : turno.user?.name || "Cliente sin nombre";
            const detalle = [turno.servicio?.nombre || "Servicio sin nombre", !personal && turno.barbero?.nombre]
              .filter(Boolean).join(" · ");

            return (
              <li key={turno.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 py-2.5 @min-[25rem]:grid-cols-[auto_minmax(0,1fr)_auto]">
                <time dateTime={new Date(turno.horarioReservado).toISOString()} className="text-sm font-semibold tabular-nums">
                  {formatearHora(turno.horarioReservado)}
                </time>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <p className="line-clamp-2 text-sm font-medium">{cliente}</p>
                  <p className="line-clamp-2 text-sm text-[var(--admin-texto-muted)]">{detalle}</p>
                </div>
                <div className="col-start-2 @min-[25rem]:col-start-3">
                  <BadgeEstadoTurno estado={turno.estado} vistaAdministrativa />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[var(--admin-border)] px-4 py-2 sm:px-5">
        <span className="text-sm text-[var(--admin-texto-muted)]">
          {total > turnos.length
            ? `${turnos.length} de ${total} turnos activos`
            : `${total} ${total === 1 ? "turno activo" : "turnos activos"}`}
        </span>
        <Link href={personal ? "/admin/turno?agenda=personal" : "/admin/turno?agenda=equipo"} className="admin-control border-transparent px-2 text-[var(--page-primary-tinta)]">
          Ver agenda <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
