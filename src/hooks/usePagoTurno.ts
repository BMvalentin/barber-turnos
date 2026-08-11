"use client";

import { crearPreferenciaPago } from "@/actions/mercadopago/mercadopago-actions";
import { useState } from "react";
import type { TurnoCreado } from "@/types/turno";

export type ParametrosPagoTurno = {
  whatsappPhone: string;
};

export function usePagoTurno({ whatsappPhone }: ParametrosPagoTurno) {
  const [turnoCreado, setTurnoCreado] = useState<TurnoCreado | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  const enviarMensajeWhatsApp = (
    turno: TurnoCreado,
    servicioNombre: string,
    barberoNombre: string,
    fecha: Date | string,
    estado: "Pagado" | "Pendiente de pago",
  ) => {
    const fechaObj = new Date(fecha);

    const fechaFormateada = fechaObj.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const mensaje = `Hola! Confirmé mi turno:
    📅 Fecha: ${fechaFormateada}
    ✂️ Servicio: ${servicioNombre}
    💈 Barbero: ${barberoNombre}
    Estado: ${estado}`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const handlePagarSenia = async () => {
    if (!turnoCreado) return;
    setCargandoPago(true);
    setErrorPago(null);

    try {
      const result = await crearPreferenciaPago(turnoCreado.id);

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

  const handlePagarDespues = () => {
    enviarMensajeWhatsApp(
      turnoCreado!,
      turnoCreado?.servicioNombre || "N/A",
      turnoCreado?.barberoNombre || "N/A",
      turnoCreado?.horarioReservado || new Date(),
      "Pendiente de pago",
    );
    setShowPagoModal(false);
    setTurnoCreado(null);
    setErrorPago(null);
  };

  return {
    turnoCreado,
    setTurnoCreado,
    showPagoModal,
    setShowPagoModal,
    cargandoPago,
    errorPago,
    handlePagarSenia,
    handlePagarDespues,
  };
}