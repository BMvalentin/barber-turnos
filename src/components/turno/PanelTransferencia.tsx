"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, Landmark, MessageCircle } from "lucide-react";
import type { TurnoCreado } from "@/types/turno";
import type { DatosTransferencia } from "@/types/pago";
import type { TipoPago } from "@/types/mercadopago";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import { cn } from "@/lib/utils/cn";

type Props = {
  turnoCreado: TurnoCreado;
  tipoPago: TipoPago;
  datosTransferencia: DatosTransferencia;
  whatsappPhone: string;
  onVolver: () => void;
  vistaAdministrativa?: boolean;
};

export default function PanelTransferencia({
  turnoCreado,
  tipoPago,
  datosTransferencia,
  whatsappPhone,
  onVolver,
  vistaAdministrativa = false,
}: Props) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const [errorCopia, setErrorCopia] = useState(false);
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
    setErrorCopia(false);
    try {
      await navigator.clipboard.writeText(valor);
    } catch {
      setErrorCopia(true);
      return;
    }
    setCopiado(nombre);
    window.setTimeout(() => setCopiado(null), 1800);
  };

  const dato = (etiqueta: string, valor: string, clave: string) => (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-[var(--admin-texto-muted)]">{etiqueta}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--admin-texto-primario)] [overflow-wrap:anywhere]">{valor || "No configurado"}</p>
      </div>
      {valor && (clave === "alias" || clave === "cbu") && (
        <button
          type="button"
          onClick={() => void copiar(clave, valor)}
          aria-label={copiado === clave ? `${etiqueta} copiado` : `Copiar ${etiqueta}`}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-lg border border-[var(--admin-border)] px-2.5 py-1.5 text-xs text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)]",
            !vistaAdministrativa && "min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]",
          )}
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
        className={cn(
          "flex items-center gap-2 rounded-md text-left text-sm text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)]",
          !vistaAdministrativa && "min-h-11 px-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]",
        )}
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
        Cambiar método de pago
      </button>

      <div className={cn(
        "border p-4",
        vistaAdministrativa
          ? "rounded-xl border-[var(--page-primary)]/30 bg-[var(--page-primary-15)]"
          : "rounded-lg border-[var(--admin-border)] bg-[var(--tema-primario-suave)]",
      )}>
        <div className="flex items-start gap-3">
          <Landmark className={cn("mt-0.5 size-5 shrink-0", vistaAdministrativa ? "text-[var(--admin-texto-primario)]" : "text-[var(--tema-primario-suave-texto)]")} aria-hidden="true" />
          <div>
            <p className={cn("font-semibold", vistaAdministrativa ? "text-[var(--admin-texto-primario)]" : "text-[var(--tema-primario-suave-texto)]")}>Datos para transferir</p>
            <p className={cn("mt-1 text-sm", vistaAdministrativa ? "text-[var(--admin-texto-secundario)]" : "text-[var(--tema-primario-suave-texto)]")}>
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

      {errorCopia && <p role="status" className="text-sm text-[var(--admin-texto-secundario)]">No se pudo copiar. Podés seleccionar y copiar el dato manualmente.</p>}

      {urlWhatsApp ? (
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex w-full items-center justify-center gap-2 px-3 py-3.5 text-center text-sm text-white transition-colors",
            vistaAdministrativa
              ? "rounded-xl bg-green-600 font-black uppercase tracking-wider hover:bg-green-500"
              : "min-h-11 rounded-lg bg-green-800 font-semibold hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]",
          )}
        >
          <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
          Mandar comprobante a WhatsApp
        </a>
      ) : (
        <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-3 text-sm text-[var(--admin-texto-primario)] [overflow-wrap:anywhere]" role="alert">
          El WhatsApp de contacto todavía no está configurado. Avisá al comercio por otro medio y conservá este número de turno: {turnoCreado.id}.
        </p>
      )}
    </div>
  );
}
