/* Tipos compartidos del dominio horarios (días laborales y márgenes). */

import type { Prisma } from "../../generated/prisma/client";

/* Margen laboral creado o actualizado (createMargenLaboral, updateMargenLaboral). */
export type MargenLaboralCreado = Prisma.margen_laboralGetPayload<{}>;

/* Día laboral creado o actualizado, con el día normalizado a número. */
export type DiaLaboralCreado = Omit<
  Prisma.dia_laboralGetPayload<{}>,
  "dia"
> & { dia: number };

/* Día laboral listado (getDiasLaborales), con márgenes y día en número. */
export type DiaLaboral = Omit<
  Prisma.dia_laboralGetPayload<{ include: { margenes: true } }>,
  "dia" | "margenes"
> & {
  dia: number;
  margenes?: MargenLaboralCreado[];
};
