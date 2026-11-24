"use client";

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, CheckCircle2, CreditCard, Loader2, Scissors, Wallet, X } from "lucide-react";
import type { TurnoCreado } from "@/types/turno";
import type { TipoPago } from "@/types/mercadopago";
import type { DatosTransferencia, MetodoPago } from "@/types/pago";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import { esTransferenciaConfigurada } from "@/lib/pagos/es-transferencia-configurada";
import { cn } from "@/lib/utils/cn";
import ModalBase from "@/components/ui/ModalBase";
import SelectorMetodoPago from "@/components/turno/SelectorMetodoPago";
import PanelTransferencia from "@/components/turno/PanelTransferencia";

type Props = {
  turnoCreado: TurnoCreado;
  cargandoPago: boolean;
  errorPago: string | null;
  transferenciaLista: boolean;
  datosTransferencia: DatosTransferencia;
  mostrarAvisoSeniaPendiente?: boolean;
  vistaAdministrativa?: boolean;
  esPagoPendiente?: boolean;
  whatsappPhone: string;
  onPagar: (tipoPago: TipoPago, metodoPago: MetodoPago) => void;
  onVolverTransferencia: () => void;
  onClose?: () => void;
  onCloseAutoFocus?: (evento: Event) => void;
};

export default function ModalPagoTurno({
  turnoCreado,
  cargandoPago,
  errorPago,
  transferenciaLista,
  datosTransferencia,
  mostrarAvisoSeniaPendiente = true,
  vistaAdministrativa = false,
  esPagoPendiente = false,
  whatsappPhone,
  onPagar,
  onVolverTransferencia,
  onClose,
  onCloseAutoFocus,
}: Props) {
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("MERCADO_PAGO");
  const [tipoPago, setTipoPago] = useState<TipoPago>("SEÑA");
  const grupoImporte = useId();

  useEffect(() => {
    if (errorPago && vistaAdministrativa) toast.error("Error de pago", { description: errorPago });
  }, [errorPago, vistaAdministrativa]);

  const total = turnoCreado.precioCongelado;
  const senia = turnoCreado.seniaCongelada;
  const saldo = Math.max(total - senia, 0);
  const titulo = esPagoPendiente ? "Completar pago" : "¡Turno reservado!";
  const transferenciaDisponible = esTransferenciaConfigurada(datosTransferencia);
  const requiereSeniaPendiente =
    mostrarAvisoSeniaPendiente &&
    turnoCreado.estado === ESTADOS_TURNO[0] &&
    turnoCreado.estadoPago === ESTADOS_PAGO[0] &&
    senia > 0;

  return (
    <ModalBase
      apariencia={vistaAdministrativa ? undefined : "publica"}
      etiquetaDialogo={titulo}
      maxWidth="max-w-md"
      overlayClase={vistaAdministrativa ? "bg-black/80 backdrop-blur-md p-4" : undefined}
      contenedorClase={vistaAdministrativa
        ? "flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]"
        : "flex flex-col overflow-hidden p-0"}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
      header={
        <div
          className={cn("flex shrink-0 items-center justify-between border-b", vistaAdministrativa ? "gap-3 border-[var(--admin-border)] p-6" : "gap-2 border-[var(--page-separador)] p-4 sm:px-6")}
          style={vistaAdministrativa ? { backgroundColor: "color-mix(in srgb, var(--page-primary) 12%, transparent)" } : undefined}
        >
          <div className="flex items-center gap-3">
            <div className={cn("grid size-10 shrink-0 place-items-center rounded-full border border-[var(--admin-border)]", vistaAdministrativa ? "bg-[var(--page-primary-20)] text-[var(--page-primary-tinta)]" : "bg-[var(--tema-primario-suave)] text-[var(--tema-primario-suave-texto)]")}>
              {esPagoPendiente ? <CreditCard className="size-5" aria-hidden="true" /> : <CheckCircle2 className="size-5" aria-hidden="true" />}
            </div>
            <div>
              <h2 className={cn("text-[var(--admin-texto-primario)]", vistaAdministrativa ? "text-lg font-bold" : "text-xl font-semibold")}>{titulo}</h2>
              <p className={cn("text-[var(--admin-texto-secundario)]", vistaAdministrativa ? "text-xs" : "text-sm")}>Elegí cómo confirmar tu lugar.</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className={vistaAdministrativa
                ? "rounded-lg px-2 py-1 text-sm text-[var(--admin-texto-muted)] transition hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
                : "grid size-11 shrink-0 place-items-center rounded-lg text-[var(--admin-texto-primario)] transition-colors duration-150 hover:bg-[var(--admin-item-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]"}
            >
              {vistaAdministrativa ? "Cerrar" : <X className="size-5" aria-hidden="true" />}
            </button>
          )}
        </div>
      }
    >
      <div className={cn("min-h-0 space-y-4 overflow-y-auto", vistaAdministrativa ? "p-6" : "overscroll-contain p-4 sm:p-6")}>
        {transferenciaLista ? (
          <PanelTransferencia
            turnoCreado={turnoCreado}
            tipoPago={tipoPago}
            datosTransferencia={datosTransferencia}
            whatsappPhone={whatsappPhone}
            onVolver={onVolverTransferencia}
            vistaAdministrativa={vistaAdministrativa}
          />
        ) : (
          <>
            {requiereSeniaPendiente && (
              <div role="note" className="flex items-start gap-3 rounded-xl border border-red-500 bg-red-950 p-4 text-red-100">
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-red-200">El turno no se confirma hasta que abones la seña.</p>
                  {vistaAdministrativa && <p>Realizá el pago de la seña para asegurar tu reserva.</p>}
                </div>
              </div>
            )}
            <div className={cn("space-y-3 rounded-lg bg-[var(--admin-surface-elevated)] p-4", vistaAdministrativa && "rounded-xl border border-[var(--admin-border)]")}>
              <div className="mb-1 flex items-center gap-2">
                <Scissors className="size-4 text-[var(--page-primary-tinta)]" aria-hidden="true" />
                <span className={vistaAdministrativa ? "text-xs font-semibold uppercase tracking-widest text-[var(--page-primary-tinta)]" : "text-sm font-semibold text-[var(--admin-texto-primario)]"}>
                  Detalle del pago
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-2">
                <span className="text-sm text-[var(--admin-texto-secundario)]">Precio del servicio</span>
                <span className="font-medium text-[var(--admin-texto-primario)]">${formatearMoneda(total)}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-2 border-t border-[var(--page-separador)] pt-3">
                <span className="text-sm text-[var(--admin-texto-secundario)]">Seña</span>
                <span className="font-medium text-[var(--admin-texto-primario)]">${formatearMoneda(senia)}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-2 border-t border-[var(--page-separador)] pt-3">
                <span className="text-sm text-[var(--admin-texto-secundario)]">Saldo en el local</span>
                <span className="font-medium text-[var(--admin-texto-primario)]">${formatearMoneda(saldo)}</span>
              </div>
            </div>

            <SelectorMetodoPago
              valor={metodoPago}
              transferenciaDisponible={transferenciaDisponible}
              onChange={setMetodoPago}
              vistaAdministrativa={vistaAdministrativa}
            />

            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-semibold text-[var(--admin-texto-primario)]">Elegí el importe</legend>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {(["SEÑA", "TOTAL"] as const).map((opcion) => {
                  const monto = opcion === "TOTAL" ? total : senia;
                  const seleccionado = tipoPago === opcion;
                  return (
                    <label
                      key={opcion}
                      className={cn(
                        "relative min-w-0 cursor-pointer rounded-lg border p-3 text-left transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[var(--page-focus-ring)]",
                        seleccionado
                          ? vistaAdministrativa ? "border-[var(--page-primary)] bg-[var(--page-primary-15)]" : "border-[var(--admin-border-fuerte)] bg-[var(--tema-primario-suave)]"
                          : "border-[var(--admin-border)] bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)]",
                      )}
                    >
                      <input type="radio" name={grupoImporte} value={opcion} checked={seleccionado} onChange={() => setTipoPago(opcion)} className="sr-only" />
                      <span className={cn("block text-xs font-semibold", seleccionado && !vistaAdministrativa ? "text-[var(--tema-primario-suave-texto)]" : "text-[var(--admin-texto-secundario)]")}>{opcion === "SEÑA" ? "Seña" : "Total"}</span>
                      <span className={cn("mt-1 block font-bold tabular-nums [overflow-wrap:anywhere]", seleccionado && !vistaAdministrativa ? "text-[var(--tema-primario-suave-texto)]" : "text-[var(--admin-texto-primario)]")}>${formatearMoneda(monto)}</span>
                      {seleccionado && !vistaAdministrativa && <Check className="absolute right-2.5 top-2.5 size-4 text-[var(--tema-primario-suave-texto)]" aria-hidden="true" />}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {errorPago && !vistaAdministrativa && (
              <p role="alert" className="rounded-lg border border-red-500 bg-red-950 p-3 text-sm text-red-100">{errorPago}</p>
            )}
            <button
              type="button"
              onClick={() => onPagar(tipoPago, metodoPago)}
              disabled={cargandoPago || (metodoPago === "TRANSFERENCIA" && !transferenciaDisponible)}
              aria-busy={cargandoPago}
              className={cn(
                "flex w-full items-center justify-center gap-2 bg-[var(--page-primary)] text-center text-sm text-[var(--page-primary-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
                vistaAdministrativa
                  ? "rounded-xl py-3.5 font-black uppercase tracking-wider shadow-lg transition-all hover:opacity-90"
                  : "min-h-11 rounded-lg border border-[var(--admin-border-fuerte)] px-3 py-2.5 font-semibold transition-colors duration-150 enabled:hover:bg-[var(--page-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]",
              )}
            >
              {cargandoPago ? <Loader2 className="size-5 shrink-0 motion-safe:animate-spin" aria-hidden="true" /> : metodoPago === "MERCADO_PAGO" ? <CreditCard className="size-5 shrink-0" aria-hidden="true" /> : <Wallet className="size-5 shrink-0" aria-hidden="true" />}
              {cargandoPago ? "Preparando pago..." : metodoPago === "MERCADO_PAGO" ? "Continuar con Mercado Pago" : "Ver datos para transferir"}
            </button>
          </>
        )}
      </div>
    </ModalBase>
  );
}
