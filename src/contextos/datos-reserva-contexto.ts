"use client";

import { createContext } from "react";
import type {
  BarberoData,
  RelacionData,
  ServicioData,
  UsuarioData,
} from "@/types/turno";

export type DatosReserva = {
  servicios: ServicioData[];
  barberos: BarberoData[];
  usuarios: UsuarioData[];
  relaciones: RelacionData[];
  whatsappPhone: string;
};

export const DATOS_RESERVA_VACIOS: DatosReserva = {
  servicios: [],
  barberos: [],
  usuarios: [],
  relaciones: [],
  whatsappPhone: "",
};

export const ContextoDatosReserva = createContext<DatosReserva>(
  DATOS_RESERVA_VACIOS,
);
