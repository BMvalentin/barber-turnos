/* Tipo compartido del dominio excepciones laborales (excepcion_laboral). */

import type { Prisma } from "../../generated/prisma/client";

/* Excepción laboral con su barbero asignado (getExcepciones del admin).
   Coincide con `prisma.excepcion_laboral.findMany({ include: { barbero: ... } })`. */
export type ExcepcionLaboral = Prisma.excepcion_laboralGetPayload<{
  include: {
    barbero: { select: { id: true; nombre: true } };
  };
}>;
