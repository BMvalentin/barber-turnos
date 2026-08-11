"use client";

import { createTurno } from "@/actions/turnos/crear.actions";
import type { TurnoCreado } from "@/types/turno";
import { ActionStateInicial } from "@/types/action-state";
import { useActionState, useEffect, useRef } from "react";
import { useSessionId } from "@/hooks/useSessionId";
import { useDatosFormularioTurno } from "./useDatosFormularioTurno";
import type { ParametrosDatosTurno } from "./useDatosFormularioTurno";
import { usePagoTurno } from "./usePagoTurno";

export type ParametrosCrearTurno = ParametrosDatosTurno & {
  whatsappPhone: string;
};

const estadoInicial = ActionStateInicial;

export function useCrearTurno({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
  whatsappPhone,
}: ParametrosCrearTurno) {
  const datos = useDatosFormularioTurno({
    session,
    initialServicios,
    initialBarberos,
    initialUsuarios,
    initialRelaciones,
  });
  const pago = usePagoTurno({ whatsappPhone });

  const [state, formAction] = useActionState(createTurno, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);
  const sessionId = useSessionId();

  useEffect(() => {
    if (state.success && state.data) {
      const nombreServicio =
        datos.servicios.find((s) => s.id === datos.selectedServicioId)?.nombre || "N/A";
      const nombreBarbero =
        datos.barberos.find((b) => b.id === datos.selectedBarberoId)?.nombre || "N/A";

      const nuevoTurno: TurnoCreado = {
        ...state.data,
        servicioNombre: nombreServicio,
        barberoNombre: nombreBarbero,
      };

      pago.setTurnoCreado(nuevoTurno);
      datos.setIsOpen(false);
      pago.setShowPagoModal(true);
      formRef.current?.reset();
      datos.setSelectedServicioId("");
      datos.setSelectedBarberoId("");
      datos.setSelectedUserId(session?.user?.role === "USER" ? session?.user?.id ?? "" : "");
    }
  }, [
    state.success,
    state.data,
    datos.servicios,
    datos.barberos,
    datos.selectedServicioId,
    datos.selectedBarberoId,
    datos.selectedUserId,
    datos.setIsOpen,
    pago.setTurnoCreado,
    pago.setShowPagoModal,
    session,
  ]);

  return {
    ...datos,
    ...pago,
    state,
    formAction,
    formRef,
    sessionId,
  };
}