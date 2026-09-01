import type { Session } from "next-auth";
import TurnoList from "@/components/turno/gestion/TurnoList";
import type { TurnoListado } from "@/types/turno";

type Propiedades = { turnos: TurnoListado[]; session: Session | null };

export default function PanelTurnosUsuario({ turnos, session }: Propiedades) {
  return (
    <div className="min-h-[500px] rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-2xl md:p-8">
      <div className="mb-6 border-b border-[var(--admin-border)] pb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--admin-texto-primario)]">Historial de <span className="text-[var(--page-primary-tinta)]">Turnos</span></h2>
      </div>
      <TurnoList turnos={turnos} session={session} />
    </div>
  );
}
