import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { ReactNode } from "react";
import type { TurnoListado } from "@/types/turno";
import CalendarioMensualTurnos from "./CalendarioMensualTurnos";

interface Props {
  fecha: string;
  barberoId: string;
  turnos: TurnoListado[];
  cargandoTurnos: boolean;
  cargandoAgenda: boolean;
  mesVisible: string;
  onCambiarMes: (mes: string) => void;
  onSeleccionar: (fecha: string) => void;
  cantidad: number | null;
  children: ReactNode;
}

export default function AgendaDiariaTurnos({ cantidad, cargandoAgenda, children, ...calendario }: Props) {
  const fecha = parseISO(calendario.fecha);
  const titulo = isValid(fecha)
    ? format(fecha, "EEEE d 'de' MMMM", { locale: es })
    : "Agenda del día";
  const estadoLista = cargandoAgenda
    ? "Cargando turnos…"
    : cantidad === null ? "" : `${cantidad} ${cantidad === 1 ? "turno" : "turnos"}`;

  return (
    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:gap-5">
      <CalendarioMensualTurnos {...calendario} vistaAdministrativa />
      <section className="admin-card min-w-0" aria-labelledby="agenda-turnos-titulo" aria-busy={cargandoAgenda}>
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--admin-border)] px-4 py-4 sm:px-5">
          <h2 id="agenda-turnos-titulo" className="text-base font-semibold first-letter:uppercase">{titulo}</h2>
          <span className="text-sm tabular-nums text-[var(--admin-texto-muted)]" role="status">
            {estadoLista}
          </span>
        </header>
        {children}
      </section>
    </div>
  );
}
