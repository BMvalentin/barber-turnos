/* Tipos compartidos del dominio barbero (formularios y modal de edición). */

import type { Prisma } from "../../generated/prisma/client";

export type ServicioOpcion = {
  id: string;
  nombre: string;
};

/* Barbero base (id, nombre, imagen y estado) usado por formularios y listas. */
export type Barbero = {
  id: string;
  nombre: string | null;
  email: string | null;
  srcImage: string | null;
  estado: boolean;
};

/* Barbero listado en la grilla del admin, con sus servicios y horarios
   (datos de admin/barbero/page.tsx: `dia` seleccionado mínimo). */
export type BarberoListado = {
  id: string;
  nombre: string | null;
  email: string | null;
  srcImage: string | null;
  estado: boolean;
  servicios?: {
    servicio: { id: string; nombre: string };
  }[];
  horarios?: {
    margenLaboralId: string;
    dia: { id: string; dia: string };
    margenLaboral: { desde: string; hasta: string };
  }[];
};

export type MargenLaboral = {
  id: string;
  desde: string;
  hasta: string;
  diaId: string;
};

export type DiaLaboral = {
  id: string;
  dia: string;
  margenes: MargenLaboral[];
};

export type BarberoEdicion = {
  id: string;
  nombre: string | null;
  email: string | null;
  srcImage: string | null;
  estado: boolean;
  servicios?: { servicio: { id: string; nombre: string } }[];
  horarios?: { margenLaboralId: string }[];
};

/* Servicio anidado en getBarberos, con montos convertidos a Number. */
type ServicioBarbero = Omit<
  Prisma.servicioGetPayload<{}>,
  "precio" | "senia" | "descuento"
> & {
  precio: number | null;
  senia: number | null;
  descuento: number | null;
};

/* Barbero listado con sus servicios y horarios (getBarberos). */
export type BarberoConRelaciones = Omit<
  Prisma.barberoGetPayload<{
    include: {
      servicios: { include: { servicio: true } };
      horarios: { include: { dia: true; margenLaboral: true } };
    };
  }>,
  "servicios"
> & {
  servicios: (Omit<
    Prisma.servicioxbarberoGetPayload<{ include: { servicio: true } }>,
    "servicio"
  > & {
    servicio: ServicioBarbero;
  })[];
};