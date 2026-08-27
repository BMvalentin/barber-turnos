"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { cancelTurno } from "@/actions/sesion/cancelar-turno.actions";
import { completedTurno } from "@/actions/turnos/completar.actions";
import { confirmarTurno } from "@/actions/turnos/confirmar.actions";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ESTADOS_TURNO } from "@/lib/constants";
import TurnoRow from "./TurnoRow";
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

type AccionConfirmacion = "cancelar" | "completar" | "confirmar";

type GrupoPorHora = { hora: number; fechaClave: string; turnos: TurnoListado[] };

function agruparPorHora(turnos: TurnoListado[]): GrupoPorHora[] {
  const grupos: GrupoPorHora[] = [];
  for (const turno of turnos) {
    const fecha = new Date(turno.horarioReservado);
    const hora = fecha.getHours();
    const fechaClave = fecha.toDateString();
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.hora === hora && ultimo.fechaClave === fechaClave) {
      ultimo.turnos.push(turno);
    } else {
      grupos.push({ hora, fechaClave, turnos: [turno] });
    }
  }
  return grupos;
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

  const grupos = useMemo(() => agruparPorHora(turnosOrdenados), [turnosOrdenados]);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [accionConfirmacion, setAccionConfirmacion] = useState<AccionConfirmacion | null>(null);
  const [turnoIdConfirmacion, setTurnoIdConfirmacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const solicitarCancelar = (id: string) => {
    setAccionConfirmacion("cancelar");
    setTurnoIdConfirmacion(id);
    setMostrarConfirmacion(true);
  };

  const solicitarCompletar = (id: string) => {
    setAccionConfirmacion("completar");
    setTurnoIdConfirmacion(id);
    setMostrarConfirmacion(true);
  };

  const solicitarConfirmar = (id: string) => {
    setAccionConfirmacion("confirmar");
    setTurnoIdConfirmacion(id);
    setMostrarConfirmacion(true);
  };

  const cancelarConfirmacion = () => {
    setMostrarConfirmacion(false);
    setAccionConfirmacion(null);
    setTurnoIdConfirmacion(null);
    setIsLoading(false);
  };

  const confirmarAccion = async () => {
    if (!turnoIdConfirmacion || !accionConfirmacion) return;
    setIsLoading(true);

    try {
      if (accionConfirmacion === "cancelar") {
        await cancelTurno(turnoIdConfirmacion);
        await retroalimentar(
          { success: true },
          "Turno cancelado",
          "El turno se ha cancelado correctamente.",
        );
        onEstadoActualizado(turnoIdConfirmacion, ESTADOS_TURNO[3]);
      } else if (accionConfirmacion === "completar") {
        const formData = new FormData();
        formData.append("id", turnoIdConfirmacion);
        await completedTurno({ success: false }, formData);
        await retroalimentar(
          { success: true },
          "Turno completado",
          "El turno se ha marcado como completado.",
        );
        onEstadoActualizado(turnoIdConfirmacion, ESTADOS_TURNO[2]);
      } else if (accionConfirmacion === "confirmar") {
        await confirmarTurno(turnoIdConfirmacion);
        await retroalimentar(
          { success: true },
          "Turno confirmado",
          "El turno se ha confirmado correctamente.",
        );
        onEstadoActualizado(turnoIdConfirmacion, ESTADOS_TURNO[1]);
      }
    } catch {
      await retroalimentar({ success: false });
    } finally {
      setIsLoading(false);
      cancelarConfirmacion();
    }
  };

  const getModalMessage = () => {
    if (accionConfirmacion === "cancelar") {
      return "¿Estás seguro de que querés cancelar este turno? Esta acción no se puede deshacer.";
    }
    if (accionConfirmacion === "completar") {
      return "¿Marcar este turno como completado? El cliente recibirá una notificación.";
    }
    if (accionConfirmacion === "confirmar") {
      return "¿Estás seguro de que querés confirmar este turno?";
    }
    return "";
  };

  const getModalTitle = () => {
    if (accionConfirmacion === "cancelar") return "Cancelar Turno";
    if (accionConfirmacion === "completar") return "Completar Turno";
    if (accionConfirmacion === "confirmar") return "Confirmar Turno";
    return "";
  };

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
      {grupos.map((grupo, indice) => (
        <div key={`${grupo.fechaClave}-${grupo.hora}`}>
          <div
            className={`flex items-center gap-3 px-4 ${indice === 0 ? "pt-3" : "pt-4"} pb-1`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-texto-muted)]">
              {grupo.hora}:00
            </span>
            <div className="h-px flex-1 bg-[var(--admin-border)]" />
          </div>
          <div>
            {grupo.turnos.map((turno) => (
              <TurnoRow
                key={turno.id}
                turno={turno}
                session={session}
                onCancelar={solicitarCancelar}
                onCompletar={solicitarCompletar}
                onConfirmar={solicitarConfirmar}
              />
            ))}
          </div>
        </div>
      ))}

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
          title={getModalTitle()}
          message={getModalMessage()}
          onConfirm={confirmarAccion}
          onCancel={cancelarConfirmacion}
        />
      )}
    </div>
  );
}
