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
      className="truncate text-xs text-[var(--admin-texto-muted)] transition-colors hover:text-[var(--page-primary-tinta)]"
    >
      {turno.user.telefono}
    </a>
  ) : (
    <p className="text-xs text-[var(--admin-texto-muted)]">Sin teléfono</p>
  );

  const inicialBarbero = turno.barbero?.nombre?.charAt(0) || "B";

  return (
    <div className="rounded-xl bg-[var(--admin-item)] p-3.5 transition-colors duration-150 hover:bg-[var(--admin-item-hover)]">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2.5">
            <span className="text-sm font-semibold tabular-nums text-[var(--admin-texto-primario)]">
              {formatearHora(turno.horarioReservado)}
            </span>
            <p className="truncate text-sm font-semibold text-[var(--admin-texto-primario)]">
              {nombreCliente}
            </p>
          </div>
          <div className="mt-0.5">{telefonoCliente}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <BadgeEstadoTurno estado={turno.estado} />
          <BadgeEstadoPago estado={turno.estadoPago} />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--admin-texto-secundario)]">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {turno.servicio?.nombre || "Servicio eliminado"} ·{" "}
            {turno.servicio?.duracion || 0} min
          </span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--page-primary-20)] text-[10px] font-bold text-[var(--page-primary-tinta)]">
            {inicialBarbero}
          </span>
          <span className="truncate">
            {turno.barbero?.nombre || "Barbero eliminado"}
          </span>
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
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
        <div className="flex items-center gap-2">
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
