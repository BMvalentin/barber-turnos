"use client";

import { CalendarDays, Check, Clock, Scissors, User } from "lucide-react";
import SelectorClienteReserva from "@/components/turno/reserva/SelectorClienteReserva";
import type { PropsResumenReserva } from "@/components/turno/reserva/tipos";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";

const CLASE_LABEL_FILA =
  "text-[11px] uppercase tracking-wider text-[var(--admin-texto-muted)]";
const CLASE_VALOR_FILA = "text-sm text-[var(--admin-texto-primario)]";
const CLASE_ICONO =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--page-primary-15)] text-[var(--page-primary-tinta)]";

export default function ResumenReserva({
  servicio,
  barbero,
  fecha,
  slotSeleccionado,
  completo,
  onCancelar,
  esAdmin,
  usuarios,
  selectedUserId,
  onCambiarCliente,
}: PropsResumenReserva) {
  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-5 lg:sticky lg:top-0 lg:self-start">
      <h2 className="text-lg font-semibold text-[var(--admin-texto-primario)]">
        Resumen del turno
      </h2>

      <div className="flex items-start gap-3">
        <div className={CLASE_ICONO}>
          <User className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className={CLASE_LABEL_FILA}>Barbero</span>
          {barbero?.nombre ? (
            <span className={CLASE_VALOR_FILA}>{barbero.nombre}</span>
          ) : (
            <span className={`${CLASE_VALOR_FILA} italic text-[var(--admin-texto-muted)]`}>
              Seleccioná un barbero
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className={CLASE_ICONO}>
          <Scissors className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className={CLASE_LABEL_FILA}>Servicio</span>
          {servicio ? (
            <span className={CLASE_VALOR_FILA}>
              {servicio.nombre} · {servicio.duracion} min
            </span>
          ) : (
            <span className={`${CLASE_VALOR_FILA} italic text-[var(--admin-texto-muted)]`}>
              Seleccioná un servicio
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className={CLASE_ICONO}>
          <CalendarDays className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className={CLASE_LABEL_FILA}>Fecha</span>
          {fecha ? (
            <span className={CLASE_VALOR_FILA}>{formatearFecha(fecha)}</span>
          ) : (
            <span className={`${CLASE_VALOR_FILA} italic text-[var(--admin-texto-muted)]`}>
              Seleccioná una fecha
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className={CLASE_ICONO}>
          <Clock className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className={CLASE_LABEL_FILA}>Hora</span>
          {slotSeleccionado ? (
            <span className={CLASE_VALOR_FILA}>{formatearHora(slotSeleccionado)}</span>
          ) : (
            <span className={`${CLASE_VALOR_FILA} italic text-[var(--admin-texto-muted)]`}>
              Seleccioná un horario
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--admin-border)]" />

      <div className="flex items-end justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]">
          Total
        </span>
        <span className="text-2xl font-bold text-[var(--page-primary-tinta)]">
          {servicio ? `$${formatearMoneda(servicio.precio)}` : "—"}
        </span>
      </div>

      {esAdmin && (
        <SelectorClienteReserva
          usuarios={usuarios}
          selectedUserId={selectedUserId}
          onCambiar={onCambiarCliente}
        />
      )}

      <BotonSubmitFormStatus
        texto={
          <span className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            CONFIRMAR TURNO
          </span>
        }
        textoMientrasCarga="Procesando..."
        deshabilitado={!completo}
        claseAdicional="w-full py-3.5 font-bold uppercase tracking-wider"
      />

      <button
        type="button"
        onClick={onCancelar}
        className="w-full rounded-lg border border-[var(--admin-border)] py-3 text-sm font-medium text-[var(--admin-texto-secundario)] transition hover:bg-white/5"
      >
        Cancelar
      </button>
    </aside>
  );
}
