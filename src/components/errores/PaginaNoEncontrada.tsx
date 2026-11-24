import Link from "next/link";
import { ArrowLeft, CalendarDays, Scissors } from "lucide-react";

export default function PaginaNoEncontrada() {
  return (
    <main
      data-pagina-no-encontrada
      className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[var(--page-bg)] px-5 pt-24 pb-10 text-[var(--page-bg-foreground)]"
    >
      <div className="barra-barberia absolute inset-y-0 left-0 w-1 opacity-70 sm:w-2" aria-hidden="true" />
      <div className="barra-barberia absolute inset-y-0 right-0 w-1 opacity-70 sm:w-2" aria-hidden="true" />

      <section className="relative w-full max-w-2xl text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-xl bg-[var(--tema-primario-suave)] text-[var(--tema-primario-suave-texto)]">
          <Scissors className="size-7" strokeWidth={1.5} aria-hidden="true" />
        </div>

        <div className="relative mx-auto mb-3 w-fit select-none">
          <p className="font-black leading-none tracking-[-0.04em] text-[clamp(6rem,22vw,12rem)] text-[var(--page-primary-tinta)]">
            404
          </p>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[var(--page-primary-tinta)]">
          Corte fuera de catálogo
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Esta página se fue a la barbería de enfrente.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-[var(--admin-texto-secundario)]">
          Parece que la dirección que buscás no existe o cambió de lugar. Volvé al inicio y elegí tu próximo turno.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="control-publico inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] px-5 py-3 text-sm font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
          <Link
            href="/dashboard?tab=turnos"
            className="control-publico inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--admin-border-fuerte)] bg-[var(--admin-surface)] px-5 py-3 text-sm font-semibold text-[var(--page-primary-tinta)] transition-colors hover:bg-[var(--admin-item)]"
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            Reservar un turno
          </Link>
        </div>

        <p className="mt-10 text-xs text-[var(--admin-texto-muted)]">
          No hace falta sacar turno para volver al inicio.
        </p>
      </section>
    </main>
  );
}
