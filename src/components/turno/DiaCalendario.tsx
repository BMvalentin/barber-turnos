"use client";

import { format } from "date-fns";

interface PropsDiaCalendario {
  dia: Date;
  estesMes: boolean;
  seleccionado: boolean;
  disponible: boolean;
  pasado: boolean;
  hoy: boolean;
  onSeleccionar: (dia: Date) => void;
}

/**
 * Celda de día del calendario con sus estados visuales.
 */
export default function DiaCalendario({
  dia,
  estesMes,
  seleccionado,
  disponible,
  pasado,
  hoy,
  onSeleccionar,
}: PropsDiaCalendario) {
  return (
    <button
      type="button"
      onClick={() => disponible && !pasado && onSeleccionar(dia)}
      disabled={!disponible || pasado || !estesMes}
      className={`
        relative flex items-center justify-center
        w-8 h-8 rounded-lg text-[11px] font-semibold
        transition-all duration-150 select-none
        ${
          !estesMes
            ? // Días fuera del mes: invisibles
              "opacity-0 pointer-events-none"
            : seleccionado
            ? // Seleccionado: cuadrado con color de marca
              "bg-[var(--page-primary)] text-[var(--page-primary-foreground)] font-black shadow-[0_0_10px_color-mix(in_srgb,var(--page-primary)_40%,transparent)]"
            : disponible && !pasado
            ? // Disponible: texto de marca, hover suave
              "text-[var(--page-primary)] font-semibold hover:bg-[var(--page-primary-15)] cursor-pointer"
            : pasado
            ? // Pasado: muy atenuado
              "text-zinc-700 cursor-not-allowed"
            : // Sin disponibilidad
              "text-zinc-600 cursor-not-allowed"
        }
      `}
    >
      {format(dia, "d")}

      {/* Puntito naranja debajo del número en días disponibles no seleccionados */}
      {disponible && !seleccionado && !pasado && estesMes && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[var(--page-primary-70)]" />
      )}

      {/* Anillo para el día de hoy (si no está seleccionado) */}
      {hoy && !seleccionado && estesMes && (
        <span className="absolute inset-0 rounded-lg ring-1 ring-[var(--page-primary-30)] pointer-events-none" />
      )}
    </button>
  );
}