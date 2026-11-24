"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { TriangleAlert, X } from "lucide-react";
import { desactivarPerfilProfesional } from "@/actions/barberos/desactivar-perfil.actions";
import type { CampoPendientePerfil } from "@/lib/barberos/perfil-profesional";
import { ActionStateInicial } from "@/types/action-state";

const ETIQUETAS_PENDIENTES: Record<CampoPendientePerfil, string> = {
  nombre: "Nombre profesional",
  foto: "Foto de perfil",
  servicio: "Al menos un servicio activo",
  horario: "Al menos un horario activo",
};

type Props = {
  pendientes: CampoPendientePerfil[];
  esEmpleado: boolean;
  alCompletar?: () => void;
};

export default function ModalPerfilIncompleto({ pendientes, esEmpleado, alCompletar }: Props) {
  const [resultado, desactivar, desactivando] = useActionState(desactivarPerfilProfesional, ActionStateInicial);
  const [pospuesto, establecerPospuesto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const focoPrevio = useRef<HTMLElement | null>(null);
  const requiereAdministrador = esEmpleado && pendientes.includes("horario");
  const soloFaltaHorario = requiereAdministrador && pendientes.length === 1;
  const enlaceCompletar = alCompletar && soloFaltaHorario
    ? "/admin/config/empleados/horarios-laborales"
    : "/admin/barbero/perfil";

  return (
    <Dialog.Root open={!pospuesto && !resultado.success} onOpenChange={(abierto) => { if (!abierto) establecerPospuesto(true); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60" />
        <Dialog.Content
          role="alertdialog"
          onEscapeKeyDown={(evento) => { if (desactivando) evento.preventDefault(); }}
          onInteractOutside={(evento) => evento.preventDefault()}
          onOpenAutoFocus={(evento) => {
            evento.preventDefault();
            focoPrevio.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            titulo.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(evento) => {
            evento.preventDefault();
            if (pospuesto && focoPrevio.current?.isConnected) focoPrevio.current.focus({ preventScroll: true });
          }}
          className="admin-card fixed top-1/2 left-1/2 z-[81] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain p-4 text-[var(--admin-texto-primario)] sm:p-5"
        >
          <div className="flex items-center gap-2.5 pr-10">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--admin-aviso-suave)] text-[var(--admin-aviso)]">
              <TriangleAlert aria-hidden="true" className="size-4" />
            </span>
            <Dialog.Title ref={titulo} tabIndex={-1} className="text-lg font-semibold tracking-tight focus-visible:outline-none!">
              Perfil incompleto
            </Dialog.Title>
          </div>
          <Dialog.Close
            disabled={desactivando}
            aria-label="Cerrar el aviso en esta vista"
            title="Cerrar por ahora"
            className="absolute top-2 right-2 grid size-11 place-items-center rounded-lg text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item-hover)] disabled:opacity-60"
          >
            <X aria-hidden="true" className="size-4" />
          </Dialog.Close>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-[var(--admin-texto-secundario)]">
            Completá estos datos para que tus clientes puedan elegirte al reservar.
          </Dialog.Description>

          <ul className="mt-3 list-disc space-y-1 rounded-lg bg-[var(--admin-item)] py-2.5 pr-3 pl-7 text-sm marker:text-[var(--admin-aviso)]" aria-label="Datos pendientes">
            {pendientes.map((campo) => <li key={campo}>{ETIQUETAS_PENDIENTES[campo]}</li>)}
          </ul>

          {requiereAdministrador && (
            <p className="mt-3 text-sm leading-relaxed text-[var(--admin-texto-secundario)]">
              Pedile a un administrador que configure tu disponibilidad.
            </p>
          )}
          {resultado.error && <p role="alert" className="mt-3 text-sm text-[var(--admin-error)]">{resultado.error}</p>}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {alCompletar && !soloFaltaHorario ? (
              <button type="button" onClick={alCompletar} disabled={desactivando} className="admin-accion">Completar perfil</button>
            ) : (
              <Link href={enlaceCompletar} className="admin-accion">
                {alCompletar && soloFaltaHorario ? "Ver mis horarios" : "Completar perfil"}
              </Link>
            )}
            <form action={desactivar}>
              <button type="submit" disabled={desactivando} className="admin-control w-full">
                {desactivando ? "Desactivando…" : "Desactivar como barbero"}
              </button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
