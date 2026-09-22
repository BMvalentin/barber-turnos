"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, Landmark, MessageCircle } from "lucide-react";
import type { TurnoCreado } from "@/types/turno";
import type { DatosTransferencia } from "@/types/pago";
import type { TipoPago } from "@/types/mercadopago";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

type Props = {
  turnoCreado: TurnoCreado;
  tipoPago: TipoPago;
  datosTransferencia: DatosTransferencia;
  whatsappPhone: string;
  onVolver: () => void;
};

export default function PanelTransferencia({
  turnoCreado,
  tipoPago,
  datosTransferencia,
  whatsappPhone,
  onVolver,
}: Props) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const monto = tipoPago === "TOTAL" ? turnoCreado.precioCongelado : turnoCreado.seniaCongelada;
  const numeroLimpio = whatsappPhone.replace(/\D/g, "");
  const mensaje = [
    "Hola! Te envío el comprobante de transferencia de mi turno.",
    `Turno: ${turnoCreado.id}`,
    turnoCreado.servicioNombre ? `Servicio: ${turnoCreado.servicioNombre}` : "",
    turnoCreado.barberoNombre ? `Barbero: ${turnoCreado.barberoNombre}` : "",
    turnoCreado.horarioReservado
      ? `Fecha y hora: ${formatearFecha(turnoCreado.horarioReservado)} ${formatearHora(turnoCreado.horarioReservado)}`
      : "",
    `Concepto: ${tipoPago === "TOTAL" ? "Pago total" : "Seña"}`,
    `Monto transferido: $${formatearMoneda(monto)}`,
    "Adjunto el comprobante para que puedan validar el pago.",
  ].filter(Boolean).join("\n");
  const urlWhatsApp = numeroLimpio
    ? `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`
    : "";

  const copiar = async (nombre: string, valor: string) => {
    if (!valor) return;
    try {
      await navigator.clipboard.writeText(valor);
    } catch {
      return;
    }
    setCopiado(nombre);
    window.setTimeout(() => setCopiado(null), 1800);
  };

  const dato = (etiqueta: string, valor: string, clave: string) => (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-[var(--admin-texto-muted)]">{etiqueta}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[var(--admin-texto-primario)]">{valor || "No configurado"}</p>
      </div>
      {valor && (clave === "alias" || clave === "cbu") && (
        <button
          type="button"
          onClick={() => void copiar(clave, valor)}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--admin-border)] px-2.5 py-1.5 text-xs text-[var(--admin-texto-secundario)] transition hover:bg-[var(--admin-item-hover)]"
        >
          {copiado === clave ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copiado === clave ? "Copiado" : "Copiar"}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-2 text-sm text-[var(--admin-texto-secundario)] transition hover:text-[var(--admin-texto-primario)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Cambiar método de pago
      </button>

      <div className="rounded-xl border border-[var(--page-primary)]/30 bg-[var(--page-primary-15)] p-4">
        <div className="flex items-start gap-3">
          <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-texto-primario)]" />
          <div>
            <p className="font-semibold text-[var(--admin-texto-primario)]">Datos para transferir</p>
            <p className="mt-1 text-sm text-[var(--admin-texto-secundario)]">
              Transferí exactamente <strong>${formatearMoneda(monto)}</strong> y luego adjuntá el comprobante en WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-4">
        {dato("Banco", datosTransferencia.transferenciaBanco, "banco")}
        {dato("Titular", datosTransferencia.transferenciaTitular, "titular")}
        {dato("CUIT", datosTransferencia.transferenciaCuit, "cuit")}
        {dato("Alias", datosTransferencia.transferenciaAlias, "alias")}
        {dato("CBU", datosTransferencia.transferenciaCbu, "cbu")}
      </div>

      {urlWhatsApp ? (
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-black uppercase tracking-wider text-white transition hover:bg-green-500"
        >
          <MessageCircle className="h-5 w-5" />
          Mandar comprobante a WhatsApp
        </a>
      ) : (
        <p className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-[var(--admin-texto-secundario)]" role="alert">
          El WhatsApp de contacto todavía no está configurado. Avisá al comercio por otro medio y conservá este número de turno: {turnoCreado.id}.
        </p>
      )}
    </div>
  );
}
