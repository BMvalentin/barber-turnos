/* Tipos compartidos del flujo de creación de turnos. */

import type { Prisma } from "../../generated/prisma/client";
import { ESTADOS_TURNO, SELECCION_USUARIO_BASICA } from "@/lib/constants";

export type ServicioData = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion: number;
  descuento: number | null;
  senia: number | null;
};

export type BarberoData = {
  id: string;
  nombre: string;
  srcImage?: string | null;
};

export type UsuarioData = {
  id: string;
  name: string | null;
  email: string | null;
};

export type RelacionData = {
  barberoId: string;
  servicioId: string;
};

export type TurnoCreado = {
  id: string;
  precioCongelado: number;
  seniaCongelada: number;
  servicioNombre?: string;
  barberoNombre?: string;
  horarioReservado?: Date | string;
};

/* Turno con cliente, barbero y servicio incluidos (createTurno, actualizarTurno). */
export type TurnoConDetalle = Omit<
  Prisma.turnoGetPayload<{
    include: {
      user: { select: typeof SELECCION_USUARIO_BASICA };
      barbero: true;
      servicio: true;
    };
  }>,
  "precioCongelado" | "seniaCongelada"
> & { precioCongelado: number; seniaCongelada: number };

/* Turno con relaciones mínimas para la confirmación de pago (confirmarPagoTurno). */
export type TurnoPagoConfirmado = Omit<
  Prisma.turnoGetPayload<{
    include: {
      user: { select: { name: true } };
      servicio: { select: { nombre: true } };
      barbero: { select: { nombre: true } };
    };
  }>,
  "precioCongelado" | "seniaCongelada"
> & { precioCongelado: number; seniaCongelada: number };

/* Turno sin relaciones (completedTurno). */
export type TurnoResumen = Omit<
  Prisma.turnoGetPayload<{}>,
  "precioCongelado" | "seniaCongelada"
> & { precioCongelado: number; seniaCongelada: number };

/* Turno listado (getTurnos del admin/dashboard), con selecciones mínimas. */
export type TurnoListado = Omit<
  Prisma.turnoGetPayload<{
    include: {
      user: { select: typeof SELECCION_USUARIO_BASICA };
      servicio: { select: { id: true; nombre: true; duracion: true } };
      barbero: { select: { id: true; nombre: true } };
    };
  }>,
  "precioCongelado" | "seniaCongelada" | "estado"
> & {
  precioCongelado: number;
  seniaCongelada: number;
  estado: (typeof ESTADOS_TURNO)[number];
};

/* DTO aplanado del panel de testing de Mercado Pago (test-mp). */
export type TurnoPruebaMp = {
  id: string;
  estado: string;
  horarioReservado: string;
  precioCongelado: number;
  seniaCongelada: number;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  userName: string | null;
  userEmail: string | null;
  servicioNombre: string;
  barberoNombre: string;
};
