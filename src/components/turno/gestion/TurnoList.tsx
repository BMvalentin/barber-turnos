"use client";

import { useEffect, useMemo, useRef } from "react";
import { Calendar } from "lucide-react";
import { completedTurno } from "@/actions/turnos/completar.actions";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import LineaTiempoTurnos from "./LineaTiempoTurnos";
import { useConfirmacionTurno } from "./use-confirmacion-turno";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { TurnoListado } from "@/types/turno";
import type { Session } from "next-auth";
import type { DatosTransferencia } from "@/types/pago";
import type { ParcheTurnoCache } from "@/lib/admin/turnos-cache-local";

interface Props {
  turnos: TurnoListado[];
  session: Session | null;
  cargandoInicial?: boolean;
  cargandoMas?: boolean;
  tieneMas?: boolean;
  errorCargaMas?: boolean;
  onCargarMas?: () => void;
  onEstadoActualizado?: (id: string, nuevoEstado: TurnoListado["estado"]) => void;
  onTurnoActualizado?: (id: string, parche: ParcheTurnoCache) => void;
  whatsappPhone?: string;
  datosTransferencia?: DatosTransferencia;
  mostrarAvisoSeniaPendiente?: boolean;
  /** Muestra la fecha de cada día aunque todos los turnos sean del mismo día. */
  mostrarFechas?: boolean;
  modoCronologicoCompacto?: boolean;
  vistaAdministrativa?: boolean;
  mensajeVacio?: string;
}

type GrupoDia = { dia: string; turnos: TurnoListado[] };

// La línea de tiempo representa un único día: se agrupa por fecha del negocio.
function agruparPorDia(turnos: TurnoListado[]): GrupoDia[] {
  const grupos: GrupoDia[] = [];
  for (const turno of turnos) {
    const dia = obtenerFechaSola(turno.horarioReservado);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.dia === dia) ultimo.turnos.push(turno);
    else grupos.push({ dia, turnos: [turno] });
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
  onTurnoActualizado,
  whatsappPhone = "",
  datosTransferencia,
  mostrarAvisoSeniaPendiente = true,
  mostrarFechas = false,
  modoCronologicoCompacto = false,
  vistaAdministrativa = false,
  mensajeVacio = "No hay turnos para mostrar.",
}: Props) {
  const gruposPorDia = useMemo(
    () =>
      agruparPorDia(
        [...turnos].sort(
          (a, b) =>
            new Date(a.horarioReservado).getTime() - new Date(b.horarioReservado).getTime(),
        ),
      ),
    [turnos],
  );
  const mostrarEncabezados = mostrarFechas || gruposPorDia.length > 1;

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
    solicitarConfirmar,
    cancelarConfirmacion,
    confirmarAccion,
  } = useConfirmacionTurno({
    alRetroalimentar: retroalimentar,
    alActualizarEstado: onEstadoActualizado,
  });

  const completarTurno = async (id: string) => {
    const datosFormulario = new FormData();
    datosFormulario.set("id", id);
    try {
      const resultado = await completedTurno({ success: false }, datosFormulario);
      await retroalimentar(resultado, "Turno completado", "El turno se ha marcado como completado.");
      if (resultado.success) onEstadoActualizado(id, "COMPLETADO");
    } catch {
      await retroalimentar({ success: false, error: "No se pudo procesar la acción." });
    }
  };

  // Sólo se reemplaza la lista por el esqueleto en la primera carga. Durante
  // un refresco con datos ya visibles se conserva el calendario montado para no
  // perder la posición de scroll.
  if (cargandoInicial && turnos.length === 0) {
    return (
      <div className={vistaAdministrativa ? "p-4 sm:p-5" : "bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4"}>
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: vistaAdministrativa ? 3 : 8 }).map((_, indice) => (
            <Skeleton key={indice} className="h-16 w-full rounded-xl bg-[var(--admin-item)] motion-reduce:animate-none" />
          ))}
        </div>
      </div>
    );
  }

  if (turnos.length === 0) {
    return (
      <EmptyState
        icono={<Calendar className={vistaAdministrativa ? "size-6" : "h-10 w-10"} aria-hidden="true" />}
        mensaje={mensajeVacio}
        claseContenedor={vistaAdministrativa
          ? "px-4 py-10"
          : `bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl ${modoCronologicoCompacto ? "p-6" : "p-12"}`}
        claseIcono={vistaAdministrativa
          ? "grid size-11 place-items-center rounded-xl bg-[var(--admin-item)]"
          : "h-10 w-10 text-[var(--admin-texto-muted)] opacity-50"}
        claseMensaje="text-[var(--admin-texto-muted)]"
      />
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {gruposPorDia.map((grupo) => (
          <section key={grupo.dia} aria-label={formatearFecha(grupo.turnos[0].horarioReservado)}>
            {mostrarEncabezados && (
              <h3 className="mb-2 text-sm font-semibold capitalize text-[var(--admin-texto-primario)]">
                {formatearFecha(grupo.turnos[0].horarioReservado)}
              </h3>
            )}
            <LineaTiempoTurnos
              turnos={grupo.turnos}
              session={session}
              onCancelar={solicitarCancelar}
              onCompletar={completarTurno}
              onConfirmar={solicitarConfirmar}
              whatsappPhone={whatsappPhone}
              datosTransferencia={datosTransferencia}
              mostrarAvisoSeniaPendiente={mostrarAvisoSeniaPendiente}
              onTurnoActualizado={onTurnoActualizado}
              modoCompacto={modoCronologicoCompacto}
              vistaAdministrativa={vistaAdministrativa}
            />
          </section>
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden="true" className="h-1" />

      {cargandoMas && (
        <div role="status" className="flex items-center justify-center gap-2 py-4">
          <span aria-hidden="true" className={`size-4 animate-spin rounded-full border-2 border-t-transparent motion-reduce:animate-none ${vistaAdministrativa ? "border-[var(--page-primary)]" : "border-current"}`} />
          <span className="text-xs text-[var(--admin-texto-muted)]">Cargando más turnos...</span>
        </div>
      )}

      {errorCargaMas && (
        <div className="flex items-center justify-center py-3">
          <button
            type="button"
            onClick={onCargarMas}
            className="control-publico min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--page-primary-tinta)] underline-offset-4 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {!vistaAdministrativa && !tieneMas && turnos.length > 0 && (
        <p className="py-3 text-center text-xs text-[var(--admin-texto-muted)]">
          No hay más turnos.
        </p>
      )}

      {mostrarConfirmacion && (
        <ConfirmDialog
          apariencia={vistaAdministrativa ? undefined : "publica"}
          etiquetaConfirmar={vistaAdministrativa ? undefined : accionConfirmacion === "cancelar" ? "Cancelar turno" : "Confirmar turno"}
          title={accionConfirmacion === "cancelar" ? "Cancelar turno" : "Confirmar turno"}
          message={accionConfirmacion === "cancelar"
            ? "¿Estás seguro de que querés cancelar este turno? Esta acción no se puede deshacer."
            : "¿Estás seguro de que querés confirmar este turno?"}
          onConfirm={confirmarAccion}
          onCancel={cancelarConfirmacion}
        />
      )}
    </div>
  );
}
