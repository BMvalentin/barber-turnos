"use client";

import { useMemo, useState } from "react";
import { MessageCircle, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

type Props = {
  numeroWhatsApp: string;
  servicioNombre?: string;
  barberoNombre?: string;
  clienteNombre?: string | null;
  horarioReservado?: string | Date | null;
  precioTotal?: number;
  señaPagada?: number;
  saldoPendiente?: number;
  tipoPago?: string | null;
  estadoPago?: string | null;
};

const ESTADOS_LEGIBLES: Record<string, string> = {
  SEÑADO: "Seña pagada",
  PAGADO: "Pago total",
  APROBADO: "Aprobado",
  EN_ACREDITACION: "En acreditación",
  PENDIENTE: "Pendiente de pago",
};

const etiquetaTipoPago = (tipoPago?: string | null): string => {
  if (tipoPago === "TOTAL") return "Pago total";
  if (tipoPago === "SEÑA") return "Seña";
  return "Seña";
};

export default function RedireccionWhatsApp({
  numeroWhatsApp,
  servicioNombre,
  barberoNombre,
  clienteNombre,
  horarioReservado,
  precioTotal,
  señaPagada,
  saldoPendiente,
  tipoPago,
  estadoPago,
}: Props) {
  const [enviado, setEnviado] = useState(false);

  const urlWhatsApp = useMemo(() => {
    const numeroLimpio = (numeroWhatsApp || "").replace(/\D/g, "");
    if (!numeroLimpio) return "";

    const partes: string[] = ["Hola! Confirmé mi turno:"];

    if (horarioReservado) {
      const fecha = new Date(horarioReservado);
      if (!isNaN(fecha.getTime())) {
        const dia = formatearFecha(fecha);
        const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
        partes.push(`📅 Día: ${diaCapitalizado}`);
        partes.push(`⏰ Horario: ${formatearHora(fecha)}`);
      }
    }

    if (servicioNombre) partes.push(`✂️ Servicio: ${servicioNombre}`);
    if (barberoNombre) partes.push(`💈 Barbero: ${barberoNombre}`);
    if (clienteNombre) partes.push(`👤 Cliente: ${clienteNombre}`);
    if (precioTotal != null) partes.push(`💰 Precio total: $${formatearMoneda(precioTotal)}`);
    if (tipoPago) partes.push(`💳 Tipo de pago: ${etiquetaTipoPago(tipoPago)}`);
    if (señaPagada != null) partes.push(`💵 Seña pagada: $${formatearMoneda(señaPagada)}`);
    if (saldoPendiente != null) partes.push(`⏳ Saldo a abonar en el local: $${formatearMoneda(saldoPendiente)}`);
    if (estadoPago) partes.push(`✔️ Estado: ${ESTADOS_LEGIBLES[estadoPago] ?? estadoPago}`);

    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(partes.join("\n"))}`;
  }, [numeroWhatsApp, servicioNombre, barberoNombre, clienteNombre, horarioReservado, precioTotal, tipoPago, señaPagada, saldoPendiente, estadoPago]);

  if (!urlWhatsApp) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-300">
        Enviá el comprobante por WhatsApp para confirmar tu turno.
      </p>
      <a
        href={urlWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setEnviado(true)}
        className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
      >
        <MessageCircle className="w-5 h-5" />
        Enviar WhatsApp
      </a>

      {/* Los enlaces de salida aparecen solo después de enviar el WhatsApp */}
      {enviado && (
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-[var(--page-primary)] hover:bg-[var(--page-primary-hover)] text-[var(--page-primary-foreground)] font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
          >
            <ArrowRight className="w-5 h-5" />
            Ver mis turnos
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  );
}
