"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  fecha: string;
  onCambiarFecha: (fecha: string) => void;
}

const FORMATO_LARGO = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatearInput(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function fechaBase(fecha: string): Date {
  if (fecha === "") {
    return new Date();
  }
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function desplazarDia(fecha: string, cantidad: number): string {
  const base = fechaBase(fecha);
  const nueva = new Date(base);
  nueva.setDate(nueva.getDate() + cantidad);
  return formatearInput(nueva);
}

export default function NavegacionFecha({ fecha, onCambiarFecha }: Props) {
  const base = fechaBase(fecha);
  const textoFecha = FORMATO_LARGO.format(base);
  const textoVisible =
    textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onCambiarFecha(desplazarDia(fecha, -1))}
        aria-label="Día anterior"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-texto-secundario)] transition-colors hover:bg-white/5 hover:text-[var(--admin-texto-primario)]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        type="button"
        className="relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--admin-texto-primario)] transition-colors hover:bg-white/5"
      >
        <Calendar className="h-4 w-4 text-[var(--page-primary-tinta)]" />
        <span>{textoVisible}</span>
        <input
          type="date"
          value={fecha}
          onChange={(e) => onCambiarFecha(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Elegir fecha"
        />
      </button>

      <button
        type="button"
        onClick={() => onCambiarFecha(desplazarDia(fecha, 1))}
        aria-label="Día siguiente"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-texto-secundario)] transition-colors hover:bg-white/5 hover:text-[var(--admin-texto-primario)]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <span className="mx-1 hidden h-4 w-px bg-[var(--admin-border)] sm:block" />

      <button
        type="button"
        disabled={fecha === ""}
        onClick={() => onCambiarFecha("")}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          fecha === ""
            ? "cursor-default text-[var(--admin-texto-muted)] disabled:opacity-60"
            : "cursor-pointer bg-[var(--page-primary-15)] text-[var(--page-primary-tinta)] hover:bg-[var(--page-primary-30)]"
        }`}
      >
        Hoy
      </button>
    </div>
  );
}
