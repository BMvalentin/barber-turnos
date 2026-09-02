"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Scissors } from "lucide-react";

const transicionEntrada = {
  duration: 0.65,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function PaginaNoEncontrada() {
  return (
    <main
      data-pagina-no-encontrada
      className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--page-bg)] px-5 py-16 text-[var(--page-bg-foreground)]"
    >
      <div className="barra-barberia absolute inset-y-0 left-0 w-2 opacity-70" />
      <div className="barra-barberia absolute inset-y-0 right-0 w-2 opacity-70" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--page-primary-20)] blur-[110px]" />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transicionEntrada}
        className="relative w-full max-w-2xl text-center"
      >
        <motion.div
          animate={{ rotate: [0, -12, 8, 0], y: [0, -5, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--page-primary-40)] bg-[var(--page-primary-15)] shadow-[0_0_45px_var(--page-primary-20)]"
        >
          <Scissors className="h-8 w-8 text-[var(--admin-texto-primario)]" strokeWidth={1.5} />
        </motion.div>

        <div className="relative mx-auto mb-3 w-fit select-none">
          <p className="numero-error font-black leading-none tracking-[-0.1em] text-[clamp(8.5rem,26vw,16rem)] text-[var(--page-primary)]">
            404
          </p>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
            className="absolute bottom-3 left-[8%] right-[5%] h-2 origin-left rounded-full bg-[var(--page-primary)]"
          />
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--page-primary)] px-5 py-3 text-sm font-semibold text-[var(--page-primary-foreground)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-focus-ring)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <Link
            href="/turno"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--admin-border-fuerte)] bg-[var(--admin-surface)] px-5 py-3 text-sm font-semibold text-[var(--page-primary-tinta)] transition-colors duration-200 hover:bg-[var(--page-primary-15)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-focus-ring)]"
          >
            <CalendarDays className="h-4 w-4" />
            Reservar un turno
          </Link>
        </div>

        <p className="mt-10 text-xs text-[var(--admin-texto-muted)]">
          No hace falta sacar turno para volver al inicio.
        </p>
      </motion.section>
    </main>
  );
}
