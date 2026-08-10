import type { CSSProperties } from "react";

export const MAP_DIA_SEMANA: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sabado",
};

export const REVERSE_MAP_DIA_SEMANA: Record<string, number> = {
  "Domingo": 0,
  "Lunes": 1,
  "Martes": 2,
  "Miercoles": 3,
  "Jueves": 4,
  "Viernes": 5,
  "Sabado": 6,
};

/* Estilo de fondo sólido de marca (botones, íconos, chips) */
export const ESTILO_FONDO_MARCA: CSSProperties = {
  backgroundColor: "var(--page-primary)",
};

/* Trío de clases de marca: fondo sólido + hover + texto legible */
export const CLASES_BOTON_MARCA =
  "bg-[var(--page-primary)] hover:bg-[var(--page-primary-80)] text-[var(--page-primary-foreground)]";

/* Botón "X" de cierre de modales (consistente con ui/dialog) */
export const CLASES_BOTON_CERRAR =
  "rounded-sm ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1 bg-[var(--page-primary)] hover:bg-[var(--page-primary-80)] text-[var(--page-primary-foreground)] hover:cursor-pointer";
