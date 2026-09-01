import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export default function TarjetaHorariosBarberos() {
  return (
    <section
      className="rounded-xl bg-[var(--admin-surface)] p-6"
      style={{ border: "1px solid var(--admin-border)" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="rounded-xl p-3"
            style={{
              backgroundColor: "var(--page-primary-20)",
              color: "var(--admin-texto-primario)",
              border: "1px solid var(--page-primary-40)",
            }}
          >
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--admin-texto-primario)]">
              Horarios de barberos
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
              Configurá los días y horarios laborales de cada barbero.
            </p>
          </div>
        </div>
        <Link
          href="/admin/config/empleados/horarios-laborales"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--page-primary)] px-4 py-2 text-sm font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)]"
        >
          Configurar horarios <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
