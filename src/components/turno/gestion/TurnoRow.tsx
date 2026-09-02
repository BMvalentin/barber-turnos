"use client";

import { Clock } from "lucide-react";
import BadgeEstadoTurno from "./BadgeEstadoTurno";
import BadgeEstadoPago from "./BadgeEstadoPago";
import MenuAccionesTurno from "./MenuAccionesTurno";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import { ESTADOS_TURNO } from "@/lib/constants";
import type { TurnoListado } from "@/types/turno";
import type { Session } from "next-auth";

interface Props {
  turno: TurnoListado;
  session: Session | null;
  onCancelar: (id: string) => void;
  onCompletar: (id: string) => void;
  onConfirmar: (id: string) => void;
}

export default function TurnoRow({
  turno,
  session,
  onCancelar,
  onCompletar,
  onConfirmar,
}: Props) {
  const esAdminUsuario = esAdmin(session);
  const esDueno =
    turno.user?.id === session?.user?.id && session?.user?.role !== "ADMIN";
  const turnoActivo =
    turno.estado === ESTADOS_TURNO[0] || turno.estado === ESTADOS_TURNO[1];
  const nombreCliente =
    turno.user?.name || turno.user?.email || "Usuario eliminado";
  const correoCliente =
    turno.user?.email && turno.user.email !== nombreCliente
      ? turno.user.email
      : null;

  const ctaPrincipal =
    esAdminUsuario && turno.estado === ESTADOS_TURNO[0] ? (
      <button
        type="button"
        onClick={() => onConfirmar(turno.id)}
        className="rounded-lg bg-[var(--page-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-80)]"
      >
        Confirmar
      </button>
    ) : esAdminUsuario && turno.estado === ESTADOS_TURNO[1] ? (
      <button
        type="button"
        onClick={() => onCompletar(turno.id)}
        className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/20"
      >
        Completar
      </button>
    ) : esDueno && turnoActivo ? (
      <button
        type="button"
        onClick={() => onCancelar(turno.id)}
        className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-400/20"
      >
        Cancelar
      </button>
    ) : null;

  const telefonoCliente = turno.user?.telefono ? (
    <a
      href={`https://wa.me/${turno.user.telefono.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-full break-words text-xs text-[var(--admin-texto-muted)] transition-colors [overflow-wrap:anywhere] hover:text-[var(--page-primary-tinta)]"
    >
      {turno.user.telefono}
    </a>
  ) : (
    <p className="text-xs text-[var(--admin-texto-muted)]">Sin teléfono</p>
  );

  const inicialBarbero = turno.barbero?.nombre?.charAt(0) || "B";

  return (
    <div className="min-w-0 rounded-xl bg-[var(--admin-item)] p-3 sm:p-3.5 transition-colors duration-150 hover:bg-[var(--admin-item-hover)]">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-x-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2.5">
            <span className="text-sm font-semibold tabular-nums text-[var(--admin-texto-primario)]">
              {formatearHora(turno.horarioReservado)}
            </span>
            <p className="min-w-0 break-words text-sm font-semibold text-[var(--admin-texto-primario)] [overflow-wrap:anywhere]">
              {nombreCliente}
            </p>
          </div>
          <div className="mt-1 min-w-0 space-y-0.5">
            {correoCliente && (
              <a
                href={`mailto:${correoCliente}`}
                className="block max-w-full break-words text-xs text-[var(--admin-texto-muted)] transition-colors [overflow-wrap:anywhere] hover:text-[var(--page-primary-tinta)]"
              >
                {correoCliente}
              </a>
            )}
            {telefonoCliente}
          </div>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-1.5">
          <BadgeEstadoTurno estado={turno.estado} />
          <BadgeEstadoPago estado={turno.estadoPago} />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--admin-texto-secundario)]">
        <span className="flex min-w-0 basis-full items-start gap-1.5 sm:basis-auto sm:items-center">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
            {turno.servicio?.nombre || "Servicio eliminado"} ·{" "}
            {turno.servicio?.duracion || 0} min
          </span>
        </span>
        <span className="flex min-w-0 basis-full items-center gap-1.5 sm:basis-auto">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--page-primary-20)] text-[10px] font-bold text-[var(--admin-texto-primario)]">
            {inicialBarbero}
          </span>
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
            {turno.barbero?.nombre || "Barbero eliminado"}
          </span>
        </span>
      </div>

      <div className="mt-2.5 flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="text-sm font-semibold text-[var(--admin-texto-primario)]">
            ${formatearMoneda(turno.precioCongelado)}
          </p>
          {turno.seniaCongelada > 0 && (
            <p className="text-xs text-[var(--admin-texto-muted)]">
              Seña {formatearMoneda(turno.seniaCongelada)}
            </p>
          )}
        </div>
        <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
          {ctaPrincipal}
          <MenuAccionesTurno
            turno={turno}
            session={session}
            onCancelar={onCancelar}
          />
        </div>
      </div>
    </div>
  );
}
