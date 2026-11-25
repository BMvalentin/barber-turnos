"use client";

import { createContext } from "react";
import type { DatosCatalogoTurno } from "@/types/turno";

export type DatosReserva = DatosCatalogoTurno;

export const DATOS_RESERVA_VACIOS: DatosReserva = {
  servicios: [],
  barberos: [],
  usuarios: [],
  relaciones: [],
};

export const ContextoDatosReserva = createContext<DatosReserva>(
  DATOS_RESERVA_VACIOS,
);
