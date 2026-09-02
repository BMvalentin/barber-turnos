"use client";

import { useEffect, useMemo, useRef } from "react";
import { Calendar } from "lucide-react";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import LineaTiempoTurnos from "./LineaTiempoTurnos";
import { useConfirmacionTurno } from "./use-confirmacion-turno";
import type { TurnoListado } from "@/types/turno";
import type { Session } from "next-auth";

interface Props {
  turnos: TurnoListado[];
  session: Session | null;
  cargandoInicial?: boolean;
  cargandoMas?: boolean;
  tieneMas?: boolean;
  errorCargaMas?: boolean;
  onCargarMas?: () => void;
  onEstadoActualizado?: (id: string, nuevoEstado: string) => void;
}

export default function TurnoList({
  turnos,
  session,
  cargandoInicial = false,
  cargandoMas = false,
  tieneMas = false,
  errorCargaMas = false,
  onCargarMas = () => {},
  onEstadoActualizado = () => {},
}: Props) {
  const turnosOrdenados = useMemo(
    () =>
      [...turnos].sort(
        (a, b) =>
          new Date(a.horarioReservado).getTime() - new Date(b.horarioReservado).getTime(),
      ),
    [turnos],
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onCargarMasRef = useRef(onCargarMas);
  onCargarMasRef.current = onCargarMas;

  useEffect(() => {
    if (cargandoInicial || cargandoMas || !tieneMas) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) onCargarMasRef.current();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cargandoInicial, cargandoMas, tieneMas, turnos.length]);

  const { retroalimentar } = useRetroalimentacionAccion({
    descripcionError: "Hubo un error al intentar procesar la acción.",
  });
  const {
    mostrarConfirmacion,
    accionConfirmacion,
    solicitarCancelar,
    solicitarCompletar,
    solicitarConfirmar,
    cancelarConfirmacion,
    confirmarAccion,
  } = useConfirmacionTurno({
    alRetroalimentar: retroalimentar,
    alActualizarEstado: onEstadoActualizado,
  });

  if (cargandoInicial) {
    return (
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, indice) => (
            <Skeleton key={indice} className="h-16 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (turnos.length === 0) {
    return (
      <EmptyState
        icono={<Calendar className="h-10 w-10" />}
        mensaje="No hay turnos para mostrar."
        claseContenedor="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-12"
        claseIcono="h-10 w-10 text-[var(--admin-texto-muted)] opacity-50"
        claseMensaje="text-[var(--admin-texto-muted)]"
      />
    );
  }

  return (
    <div>
      <LineaTiempoTurnos
        turnos={turnosOrdenados}
        session={session}
        onCancelar={solicitarCancelar}
        onCompletar={solicitarCompletar}
        onConfirmar={solicitarConfirmar}
      />

      <div ref={sentinelRef} aria-hidden="true" className="h-1" />

      {cargandoMas && (
        <div className="flex items-center justify-center gap-2 py-4">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--page-primary)] border-t-transparent" />
          <span className="text-xs text-[var(--admin-texto-muted)]">Cargando más turnos...</span>
        </div>
      )}

      {errorCargaMas && (
        <div className="flex items-center justify-center py-3">
          <button
            type="button"
            onClick={onCargarMas}
            className="text-xs font-semibold text-[var(--page-primary-tinta)] hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {!tieneMas && turnos.length > 0 && (
        <p className="py-3 text-center text-xs text-[var(--admin-texto-muted)]">
          No hay más turnos.
        </p>
      )}

      {mostrarConfirmacion && (
        <ConfirmDialog
          title={accionConfirmacion === "cancelar" ? "Cancelar Turno" : accionConfirmacion === "completar" ? "Completar Turno" : "Confirmar Turno"}
          message={accionConfirmacion === "cancelar" ? "¿Estás seguro de que querés cancelar este turno? Esta acción no se puede deshacer." : accionConfirmacion === "completar" ? "¿Marcar este turno como completado? El cliente recibirá una notificación." : "¿Estás seguro de que querés confirmar este turno?"}
          onConfirm={confirmarAccion}
          onCancel={cancelarConfirmacion}
        />
      )}
    </div>
  );
}
