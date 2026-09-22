"use client";

import { crearPreferenciaPago } from "@/actions/mercadopago/crear-preferencia.actions";
import { registrarTransferencia } from "@/actions/turnos/registrar-transferencia.actions";
import { useState } from "react";
import type { TurnoCreado } from "@/types/turno";
import type { TipoPago } from "@/types/mercadopago";
import type { MetodoPago } from "@/types/pago";

export type ParametrosPagoTurno = {
  whatsappPhone: string;
};

export function usePagoTurno({ whatsappPhone }: ParametrosPagoTurno) {
  // El envío de WhatsApp al barbero ocurre en /pago/success (RedireccionWhatsApp).
  // Se conserva el parámetro por compatibilidad con la cadena de Props existente.
  void whatsappPhone;
  const [turnoCreado, setTurnoCreado] = useState<TurnoCreado | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [transferenciaLista, setTransferenciaLista] = useState(false);

  const handlePagar = async (tipoPago: TipoPago, metodoPago: MetodoPago) => {
    if (!turnoCreado) return;
    setCargandoPago(true);
    setErrorPago(null);

    try {
      if (metodoPago === "TRANSFERENCIA") {
        const resultado = await registrarTransferencia(turnoCreado.id, tipoPago);
        if (!resultado.success) {
          setErrorPago(resultado.error ?? "No se pudo registrar la transferencia");
          setCargandoPago(false);
          return;
        }
        setTransferenciaLista(true);
        setCargandoPago(false);
        return;
      }

      const result = await crearPreferenciaPago(turnoCreado.id, tipoPago);

      if (!result.success || !result.data?.checkoutUrl) {
        setErrorPago(result.error ?? "No se pudo generar el enlace de pago");
        setCargandoPago(false);
        return;
      }

      // El mensaje de WhatsApp al barbero se envía recién cuando el pago
      // se confirma en el servidor (webhook/back_url), desde /pago/success
      window.location.href = result.data.checkoutUrl;
    } catch {
      setErrorPago("Error inesperado al iniciar el pago");
      setCargandoPago(false);
    }
  };

  return {
    turnoCreado,
    setTurnoCreado,
    showPagoModal,
    setShowPagoModal,
    cargandoPago,
    errorPago,
    transferenciaLista,
    setTransferenciaLista,
    handlePagar,
  };
}
