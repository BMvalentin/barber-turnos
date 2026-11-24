import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { formatearHora } from "@/lib/utils/formatear-hora";
import type { TurnoListado } from "@/types/turno";
import BadgeEstadoTurno from "./BadgeEstadoTurno";

interface Props {
  turno: TurnoListado;
  nombreCliente: string;
  contacto: ReactNode;
  importe: ReactNode;
  estadoPago: ReactNode;
  formaDePago: ReactNode;
  acciones: ReactNode;
}

export default function FilaAgendaTurno({
  turno,
  nombreCliente,
  contacto,
  importe,
  estadoPago,
  formaDePago,
  acciones,
}: Props) {
  const servicio = turno.servicio?.nombre || "Servicio eliminado";
  const empleado = turno.barbero?.nombre || "Barbero eliminado";

  return (
    <details className="group/turno min-w-0">
      <summary className="grid min-h-16 cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1 px-4 py-3 transition-colors hover:bg-[var(--admin-item)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--page-focus-ring)] sm:gap-x-3 sm:px-5 [&::-webkit-details-marker]:hidden">
        <time
          dateTime={new Date(turno.horarioReservado).toISOString()}
          className="self-start rounded-md bg-[var(--admin-item)] px-1.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--admin-texto-secundario)] sm:px-2 sm:text-sm"
        >
          {formatearHora(turno.horarioReservado)}
        </time>
        <span className="min-w-0">
          <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{nombreCliente}</span>
          <span className="mt-0.5 block text-xs text-[var(--admin-texto-muted)] [overflow-wrap:anywhere]">
            {servicio}{turno.servicio && ` · ${turno.servicio.duracion} min`} · {empleado}
          </span>
        </span>
        <span className="flex flex-col-reverse items-end justify-center gap-1 sm:flex-row sm:items-center sm:gap-2">
          <BadgeEstadoTurno estado={turno.estado} vistaAdministrativa />
          <ChevronDown size={16} className="shrink-0 text-[var(--admin-texto-muted)] transition-transform group-open/turno:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </span>
      </summary>
      <div className="mx-4 grid gap-4 border-t border-[var(--admin-border)] py-4 sm:mx-5 sm:grid-cols-2">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold">Contacto</p>
          {contacto}
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2">{importe}</div>
          <div className="flex flex-wrap items-center gap-2">
            {estadoPago}
            {formaDePago}
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 empty:hidden sm:col-span-2">
          {acciones}
        </div>
      </div>
    </details>
  );
}
