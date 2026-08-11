/* Tipos compartidos del dominio servicio (lista, tabla, filas y stats). */

import type { Prisma } from "../../generated/prisma/client";

export type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  srcImage: string | null;
  estado: boolean;
  duracion: number;
  precio: number;
  descuento: number;
  senia: number;
  createdAt: Date;
  barberos?: {
    barbero: {
      id: string;
      nombre: string;
    };
  }[];
};

export type Barbero = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
};

/* Servicio creado o actualizado (createServicio, actualizarServicio), con montos en Number. */
export type ServicioCreado = Omit<
  Prisma.servicioGetPayload<{}>,
  "precio" | "descuento" | "senia"
> & { precio: number; descuento: number; senia: number };

/* Servicio listado con sus barberos (getServicios). */
export type ServicioConBarberos = Omit<
  Prisma.servicioGetPayload<{
    include: {
      servicios: {
        include: {
          barbero: {
            select: {
              id: true;
              nombre: true;
              srcImage: true;
              estado: true;
              horarios: { where: { estado: true }; include: { dia: true } };
            };
          };
        };
      };
    };
  }>,
  "precio" | "descuento" | "senia"
> & { precio: number; descuento: number; senia: number };

/* Servicio del carrusel público (getServiciosCarrusel), con montos convertidos a Number. */
export type ServicioCarrusel = Omit<
  Prisma.servicioGetPayload<{
    select: {
      id: true;
      nombre: true;
      descripcion: true;
      srcImage: true;
      precio: true;
      descuento: true;
    };
  }>,
  "precio" | "descuento"
> & { precio: number; descuento: number };
