"use client";

import { createTurno } from "@/actions/turnos/crear.actions";
import { actualizarTurno } from "@/actions/turnos/estado.actions";
import type { TurnoCreado, TurnoListado } from "@/types/turno";
import { ActionStateInicial } from "@/types/action-state";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionId } from "@/hooks/useSessionId";
import { useDatosFormularioTurno } from "./useDatosFormularioTurno";
import type { ParametrosDatosTurno } from "./useDatosFormularioTurno";
import { usePagoTurno } from "./usePagoTurno";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { ESTADOS_PAGO } from "@/lib/constants";

export type ParametrosFormularioTurno = ParametrosDatosTurno & {
  whatsappPhone: string;
  turnoInicial?: TurnoListado | null;
  /** Callback opcional que se invoca al crear un turno con éxito, para refrescar el listado. */
  onTurnoCreado?: () => void;
};

const estadoInicial = ActionStateInicial;

/**
 * Hook genérico del modal de turnos: crea o edita según venga `turnoInicial`.
 * Cuando es edición no pasa por el flujo de pago (solo lo usan admins).
 */
export function useFormularioTurno({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
  whatsappPhone,
  turnoInicial,
  onTurnoCreado,
}: ParametrosFormularioTurno) {
  const esEdicion = Boolean(turnoInicial);

  const datos = useDatosFormularioTurno({
    session,
    initialServicios,
    initialBarberos,
    initialUsuarios,
    initialRelaciones,
    turnoInicial,
  });
  const pago = usePagoTurno({ whatsappPhone });

  const accion = esEdicion ? actualizarTurno : createTurno;
  const [state, formAction] = useActionState(accion, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);
  const sessionId = useSessionId();
  const turnoProcesadoRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.success || !state.data) return;

    if (esEdicion) {
      datos.setIsOpen(false);
      toast.success("Turno actualizado correctamente");
      window.location.reload();
      return;
    }

    if (turnoProcesadoRef.current === state.data.id) return;
    turnoProcesadoRef.current = state.data.id;
    const nombreServicio =
      datos.servicios.find((s) => s.id === datos.selectedServicioId)?.nombre || "N/A";
    const nombreBarbero =
      datos.barberos.find((b) => b.id === datos.selectedBarberoId)?.nombre || "N/A";

    const nuevoTurno: TurnoCreado = {
      ...state.data,
      servicioNombre: nombreServicio,
      barberoNombre: nombreBarbero,
    };

    datos.setIsOpen(false);
    formRef.current?.reset();
    datos.setSelectedServicioId("");
    datos.setSelectedBarberoId("");
    datos.setSelectedUserId(session?.user?.role === "USER" ? session?.user?.id ?? "" : "");
    datos.setEstadoPago(ESTADOS_PAGO[0]);

    onTurnoCreado?.();

    if (esAdmin(session)) {
      // El admin carga el turno directamente: sin modal de seña ni WhatsApp
      toast.success("Turno creado correctamente");
      router.refresh();
    } else {
      pago.setTurnoCreado(nuevoTurno);
      pago.setShowPagoModal(true);
    }
  }, [
    state.success,
    state.data,
    esEdicion,
    datos.servicios,
    datos.barberos,
    datos.selectedServicioId,
    datos.selectedBarberoId,
    datos.selectedUserId,
    datos.setIsOpen,
    datos.setEstadoPago,
    pago.setTurnoCreado,
    pago.setShowPagoModal,
    session,
    onTurnoCreado,
    router,
  ]);

  return {
    esEdicion,
    ...datos,
    ...pago,
    state,
    formAction,
    formRef,
    sessionId,
  };
}
