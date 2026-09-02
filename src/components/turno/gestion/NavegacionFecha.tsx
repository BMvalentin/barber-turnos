"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import CalendarioNavegacion from "./CalendarioNavegacion";

interface Props {
  fecha: string;
  onCambiarFecha: (fecha: string) => void;
  estado?: string;
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

export default function NavegacionFecha({ fecha, onCambiarFecha, estado }: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const manejarClickFuera = (event: MouseEvent) => {
      const objetivo = event.target as Node;
      if (contenedorRef.current && !contenedorRef.current.contains(objetivo)) {
        setAbierto(false);
      }
    };

    const manejarTeclaEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAbierto(false);
      }
    };

    window.addEventListener("mousedown", manejarClickFuera);
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => {
      window.removeEventListener("mousedown", manejarClickFuera);
      window.removeEventListener("keydown", manejarTeclaEscape);
    };
  }, [abierto]);

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
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div ref={contenedorRef} className="relative">
        <button
          type="button"
          aria-label="Elegir fecha"
          aria-expanded={abierto}
          onClick={() => setAbierto((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--admin-texto-primario)] transition-colors hover:bg-[var(--admin-item-hover)]"
        >
          <Calendar className="h-4 w-4 text-[var(--page-primary-tinta)]" />
          <span>{textoVisible}</span>
        </button>

        <div
          className={`absolute left-1/2 top-full z-40 mt-2 w-[min(320px,80vw)] -translate-x-1/2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-2 shadow-2xl shadow-black/40 ${
            abierto ? "" : "pointer-events-none invisible"
          }`}
        >
          <CalendarioNavegacion
            fecha={fecha}
            estado={estado ?? "TODOS"}
            onSeleccionar={(dia) => {
              onCambiarFecha(dia);
              setAbierto(false);
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onCambiarFecha(desplazarDia(fecha, 1))}
        aria-label="Día siguiente"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
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
            : "cursor-pointer bg-[var(--page-primary-15)] text-[var(--admin-texto-primario)] hover:bg-[var(--page-primary-30)]"
        }`}
      >
        Hoy
      </button>
    </div>
  );
}
