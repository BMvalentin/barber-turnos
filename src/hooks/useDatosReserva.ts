"use client";

import { useContext } from "react";
import { ContextoDatosReserva } from "@/contextos/datos-reserva-contexto";

export function useDatosReserva() {
  return useContext(ContextoDatosReserva);
}
