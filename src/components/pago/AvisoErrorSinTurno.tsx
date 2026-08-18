"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function AvisoErrorSinTurno() {
  useEffect(() => {
    toast.error("Error en la solicitud", {
      description: "No pudimos encontrar una referencia de turno válida para verificar este pago.",
    });
  }, []);

  return null;
}
