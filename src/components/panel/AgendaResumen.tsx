import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import BadgeEstadoTurno from "@/components/turno/gestion/BadgeEstadoTurno";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { formatearHora } from "@/lib/utils/formatear-hora";

export type TurnoAgendaResumen = {
  id: string;
  estado: string;
  horarioReservado: Date | string;
  clienteNombre?: string | null;
  clienteApellido?: string | null;
  user: { name: string | null; email: string | null } | null;
  servicio: { nombre: string } | null;
};

type GrupoAgendaResumen = {
  id: string;
  nombre?: string;
  turnos: TurnoAgendaResumen[];
};

export function AgendaResumen({ grupos }: { grupos: GrupoAgendaResumen[] }) {
  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--admin-border)] px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]">
            <CalendarDays size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Agenda de hoy</h2>
            <p className="text-xs text-[var(--admin-texto-muted)] first-letter:uppercase">{formatearFecha(new Date())}</p>
          </div>
        </div>
        <Link href="/admin/turno" className="admin-control min-h-9 border-transparent px-2 text-xs text-[var(--page-primary-tinta)] sm:px-3 sm:text-sm">
          Ver turnos <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {grupos.length === 0 ? (
        <p className="px-4 py-6 text-sm text-[var(--admin-texto-muted)] sm:px-5">
          No hay turnos activos para hoy.
        </p>
      ) : (
        <div className="divide-y divide-[var(--admin-border)]">
          {grupos.map((grupo) => (
            <div key={grupo.id} className="px-4 py-2 sm:px-5">
              {grupo.nombre && (
                <h3 className="pt-2 pb-1 text-sm font-semibold [overflow-wrap:anywhere]">{grupo.nombre}</h3>
              )}
              <ul className="divide-y divide-[var(--admin-border)]">
                {grupo.turnos.map((turno) => {
                  const cliente = turno.clienteNombre
                    ? [turno.clienteNombre, turno.clienteApellido].filter(Boolean).join(" ")
                    : turno.user?.name || turno.user?.email || "Usuario eliminado";

                  return (
                    <li key={turno.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 py-2.5 sm:gap-3">
                      <time dateTime={new Date(turno.horarioReservado).toISOString()} className="text-sm font-semibold tabular-nums">
                        {formatearHora(turno.horarioReservado)}
                      </time>
                      <div className="min-w-0 [overflow-wrap:anywhere]">
                        <p className="text-sm font-medium">{cliente}</p>
                        <p className="text-xs text-[var(--admin-texto-muted)]">
                          {turno.servicio?.nombre || "Servicio eliminado"}
                        </p>
                      </div>
                      <BadgeEstadoTurno estado={turno.estado} vistaAdministrativa />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
