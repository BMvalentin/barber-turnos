"use client";

import type { ReactNode } from "react";
import { ContextoDatosReserva } from "@/contextos/datos-reserva-contexto";
import type { DatosReserva } from "@/contextos/datos-reserva-contexto";

type PropsProveedorDatosReserva = DatosReserva & {
  children: ReactNode;
};

export default function DatosReservaProveedor({
  servicios,
  barberos,
  usuarios,
  relaciones,
  whatsappPhone,
  children,
}: PropsProveedorDatosReserva) {
  return (
    <ContextoDatosReserva.Provider
      value={{ servicios, barberos, usuarios, relaciones, whatsappPhone }}
    >
      {children}
    </ContextoDatosReserva.Provider>
  );
}
