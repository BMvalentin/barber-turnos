"use client";

import { createTurno } from "@/actions/turnos/crear.actions";
import type { TurnoCreado } from "@/types/turno";
import { ActionStateInicial } from "@/types/action-state";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionId } from "@/hooks/useSessionId";
import { useDatosFormularioTurno } from "./useDatosFormularioTurno";
import type { ParametrosDatosTurno } from "./useDatosFormularioTurno";
import { usePagoTurno } from "./usePagoTurno";
import { esAdmin } from "@/lib/seguridad/es-admin";

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
  const turnoProcesadoRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (
      state.success &&
      state.data &&
      turnoProcesadoRef.current !== state.data.id
    ) {
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

      if (esAdmin(session)) {
        // El admin carga el turno directamente: sin modal de seña ni WhatsApp
        toast.success("Turno creado correctamente");
        router.refresh();
      } else {
        pago.setTurnoCreado(nuevoTurno);
        pago.setShowPagoModal(true);
      }
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