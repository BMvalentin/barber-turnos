/* Tipos compartidos del dominio horarios (días laborales y márgenes). */

import type { Prisma } from "../../generated/prisma/client";

/* Margen laboral creado o actualizado (createMargenLaboral, updateMargenLaboral). */
export type MargenLaboralCreado =
  Prisma.margen_laboralGetPayload<Prisma.margen_laboralDefaultArgs>;

/* Día laboral creado o actualizado, con el día normalizado a número. */
export type DiaLaboralCreado = Omit<
  Prisma.dia_laboralGetPayload<Prisma.dia_laboralDefaultArgs>,
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

/* Rango de horario (bloque de trabajo) de un día. */
export type RangoHorario = { desde: string; hasta: string };

/* Fila de horario por día que se envía al guardar (guardarHorariosBarbero). */
export type HorarioDiaBarbero = {
  diaId: string;
  trabaja: boolean;
  rangos: RangoHorario[];
};

/* Asignación de un margen a un barbero (editor de horarios por empleado). */
export type MargenAsignadoBarbero = {
  id: string;
  estado: boolean;
  diaId: string;
  dia: { id: string; dia: string };
  margenLaboral: { desde: string; hasta: string };
};

/* Barbero listado para el editor de horarios (obtenerBarberosParaHorarios). */
export type BarberoParaHorarios = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  horarios: MargenAsignadoBarbero[];
};
