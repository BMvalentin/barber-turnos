"use client";

import {
  CalendarDays,
  Check,
  Clock,
  Save,
  Scissors,
  User,
  UserRound,
} from "lucide-react";
import SelectorClienteReserva from "@/components/turno/reserva/SelectorClienteReserva";
import SelectorEstadoPago from "@/components/turno/reserva/SelectorEstadoPago";
import SelectorEstadoTurno from "@/components/turno/reserva/SelectorEstadoTurno";
import type { PropsResumenReserva } from "@/components/turno/reserva/tipos";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";

const CLASE_LABEL_FILA =
  "text-[11px] uppercase tracking-wider text-[var(--admin-texto-muted)]";
const CLASE_LABEL_MONTO =
  "text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]";
const CLASE_VALOR_FILA = "text-sm text-[var(--admin-texto-primario)] in-[.reserva-publica]:[overflow-wrap:anywhere]";
const CLASE_ICONO =
  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--page-primary-15)] text-[var(--admin-texto-primario)] in-[.reserva-publica]:bg-[var(--tema-primario-suave)] in-[.reserva-publica]:text-[var(--tema-primario-suave-texto)]";

export default function ResumenReserva({
  error,
  servicio,
  barbero,
  fecha,
  slotSeleccionado,
  completo,
  onCancelar,
  puedeGestionarTurnos,
  usuarios,
  selectedUserId,
  onCambiarCliente,
  clienteNombre,
  onCambiarClienteNombre,
  clienteApellido,
  onCambiarClienteApellido,
  esEdicion = false,
  estadoPago,
  onCambiarEstadoPago,
  estadoTurno,
  onCambiarEstadoTurno,
  clienteUsuario,
  senia,
  total,
}: PropsResumenReserva) {
  const montoTotal = total ?? servicio?.precio ?? 0;
  const montoSeña = senia ?? 0;
  const montoSaldo = montoTotal - montoSeña;
  const hayImportes = total !== undefined || servicio !== null;

  return (
    <aside className="flex flex-col gap-4 rounded-xl bg-[var(--admin-surface-elevated)] p-4 sm:gap-5 sm:p-5">
      <h2 className="text-lg font-semibold text-[var(--admin-texto-primario)]">
        Resumen del turno
      </h2>

      <div className="flex items-start gap-3">
        <div className={CLASE_ICONO}>
          <User className="h-4 w-4" />
        </div>
        <div className="flex min-w-0 flex-col">
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
        <div className="flex min-w-0 flex-col">
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

      {!puedeGestionarTurnos && clienteUsuario && (
        <div className="flex items-start gap-3">
          <div className={CLASE_ICONO}>
            <UserRound className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className={CLASE_LABEL_FILA}>Cliente</span>
            <span className={CLASE_VALOR_FILA}>{clienteUsuario.nombre || "Usuario"}</span>
            <span className="text-xs text-[var(--admin-texto-muted)]">
              {clienteUsuario.telefono || "Sin teléfono"}
            </span>
          </div>
        </div>
      )}

      <div className="border-t border-[var(--page-separador)]" />

      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className={CLASE_LABEL_MONTO}>Total</span>
        <span className="text-2xl font-bold tabular-nums text-[var(--page-primary-tinta)] [overflow-wrap:anywhere]">
          {hayImportes ? `$${formatearMoneda(montoTotal)}` : "—"}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className={CLASE_LABEL_MONTO}>Seña</span>
        <span className="text-sm font-semibold tabular-nums text-[var(--admin-texto-primario)]">
          {hayImportes ? `$${formatearMoneda(montoSeña)}` : "—"}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className={CLASE_LABEL_MONTO}>Saldo restante</span>
        <span className="text-sm font-semibold tabular-nums text-[var(--admin-texto-primario)]">
          {hayImportes ? `$${formatearMoneda(montoSaldo)}` : "—"}
        </span>
      </div>

      {puedeGestionarTurnos && (
        <>
          <SelectorClienteReserva
            usuarios={usuarios}
            selectedUserId={selectedUserId}
            onCambiar={onCambiarCliente}
            esEdicion={esEdicion}
            clienteNombre={clienteNombre}
            onCambiarClienteNombre={onCambiarClienteNombre}
            clienteApellido={clienteApellido}
            onCambiarClienteApellido={onCambiarClienteApellido}
          />
          {esEdicion && (
            <SelectorEstadoTurno
              valor={estadoTurno}
              onChange={onCambiarEstadoTurno}
            />
          )}
          <SelectorEstadoPago
            valor={estadoPago}
            onChange={onCambiarEstadoPago}
          />
        </>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-500 bg-red-950 p-3 text-sm text-red-100">{error}</p>
      )}
      <BotonSubmitFormStatus
        texto={
          <span className="flex items-center justify-center gap-2">
            {esEdicion ? (
              <Save className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {esEdicion ? "GUARDAR CAMBIOS" : "CONFIRMAR TURNO"}
          </span>
        }
        textoMientrasCarga={esEdicion ? "Guardando..." : "Procesando..."}
        deshabilitado={!completo}
        claseAdicional="w-full py-3.5 font-bold uppercase tracking-wider in-[.reserva-publica]:min-h-11 in-[.reserva-publica]:border in-[.reserva-publica]:border-[var(--admin-border-fuerte)] in-[.reserva-publica]:hover:brightness-100 in-[.reserva-publica]:[&_svg]:motion-reduce:animate-none"
      />

      <button
        type="button"
        onClick={onCancelar}
        className="control-publico min-h-11 w-full rounded-md py-3 text-sm font-medium text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
      >
        Cancelar
      </button>
    </aside>
  );
}
