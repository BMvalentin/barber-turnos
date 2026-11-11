"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ContextoConsentimientoLegal = {
  aceptado: boolean;
  marcarAceptado: () => void;
};

const ContextoLegal = createContext<ContextoConsentimientoLegal | null>(null);

export function ProveedorConsentimientoLegal({
  aceptadoInicial,
  children,
}: {
  aceptadoInicial: boolean;
  children: React.ReactNode;
}) {
  const [aceptado, setAceptado] = useState(aceptadoInicial);

  useEffect(() => {
    setAceptado(aceptadoInicial);
  }, [aceptadoInicial]);

  return (
    <ContextoLegal.Provider
      value={{ aceptado, marcarAceptado: () => setAceptado(true) }}
    >
      {children}
    </ContextoLegal.Provider>
  );
}

export function useConsentimientoLegal() {
  const contexto = useContext(ContextoLegal);
  if (!contexto) {
    throw new Error("useConsentimientoLegal requiere su proveedor.");
  }
  return contexto;
}
