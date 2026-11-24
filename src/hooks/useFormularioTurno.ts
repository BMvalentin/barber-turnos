"use client";

import { createTurno, reservarTurnoPropio } from "@/actions/turnos/crear.actions";
import { actualizarTurno } from "@/actions/turnos/estado.actions";
import type { TurnoConDetalle, TurnoCreado, TurnoListado } from "@/types/turno";
import { ActionStateInicial } from "@/types/action-state";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionId } from "@/hooks/useSessionId";
import { useDatosFormularioTurno } from "./useDatosFormularioTurno";
import type { ParametrosDatosTurno } from "./useDatosFormularioTurno";
import { usePagoTurno } from "./usePagoTurno";
import { esAdmin, esEmpleado } from "@/lib/seguridad/es-admin";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import type { ParcheTurnoCache } from "@/lib/admin/turnos-cache-local";
import type { DatosTransferencia } from "@/types/pago";
import { invalidarDisponibilidadLocal } from "@/lib/turnos/disponibilidad-cliente";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";

export type ParametrosFormularioTurno = ParametrosDatosTurno & {
  vistaAdministrativa?: boolean;
  whatsappPhone: string;
  onTurnoActualizado?: (id: string, parche: ParcheTurnoCache) => void;
  datosTransferencia?: DatosTransferencia;
  turnoInicial?: TurnoListado | null;
  /** Callback para agregar el turno recién creado a la colección local. */
  onTurnoCreado?: (turno: TurnoConDetalle) => void;
};

const estadoInicial = ActionStateInicial;

/**
 * Hook genérico del modal de turnos: crea o edita según venga `turnoInicial`.
 * Cuando es edición no pasa por el flujo de pago (solo lo usan admins).
 */
export function useFormularioTurno({
  session,
  initialServicios,
  initialBarberos,
  initialUsuarios,
  initialRelaciones,
  whatsappPhone,
  onTurnoActualizado,
  turnoInicial,
  onTurnoCreado,
  vistaAdministrativa,
}: ParametrosFormularioTurno) {
  const puedeGestionarTurnos = Boolean(vistaAdministrativa && (esAdmin(session) || esEmpleado(session)));
  const esEdicion = puedeGestionarTurnos && Boolean(turnoInicial);

  const datos = useDatosFormularioTurno({
    session,
    initialServicios,
    initialBarberos,
    initialUsuarios,
    initialRelaciones,
    turnoInicial: esEdicion ? turnoInicial : undefined,
    puedeGestionarTurnos,
  });
  const pago = usePagoTurno({ whatsappPhone, onTurnoActualizado });
  const {
    servicios,
    barberos,
    selectedServicioId,
    selectedBarberoId,
    setIsOpen,
    setSelectedServicioId,
    setSelectedBarberoId,
    setSelectedUserId,
    setClienteNombre,
    setClienteApellido,
    setEstadoPago,
  } = datos;
  const { setTurnoCreado, setShowPagoModal, setTransferenciaLista } = pago;

  const accion = esEdicion ? actualizarTurno : puedeGestionarTurnos ? createTurno : reservarTurnoPropio;
  const [state, formAction] = useActionState(accion, estadoInicial);
  const estadoEdicionProcesado = useRef(state);
  const formRef = useRef<HTMLFormElement>(null);
  const sessionId = useSessionId();
  const turnoProcesadoRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.success || !state.data) return;

    if (esEdicion) {
      if (estadoEdicionProcesado.current === state) return;
      estadoEdicionProcesado.current = state;
      if (turnoInicial) invalidarDisponibilidadLocal(turnoInicial.barberoId, obtenerFechaSola(turnoInicial.horarioReservado));
      invalidarDisponibilidadLocal(state.data.barberoId, obtenerFechaSola(state.data.horarioReservado));
      const parche: ParcheTurnoCache = {
        estado: state.data.estado,
        estadoPago: state.data.estadoPago,
        tipoPago: state.data.tipoPago,
        metodoPago: state.data.metodoPago,
        horarioReservado: state.data.horarioReservado,
        barberoId: state.data.barberoId,
        servicioId: state.data.servicioId,
        precioCongelado: state.data.precioCongelado,
        seniaCongelada: state.data.seniaCongelada,
        barbero: { id: state.data.barbero.id, nombre: state.data.barbero.nombre },
        servicio: {
          id: state.data.servicio.id,
          nombre: state.data.servicio.nombre,
          duracion: state.data.servicio.duracion,
        },
      };
      onTurnoActualizado?.(state.data.id, parche);
      setIsOpen(false);
      toast.success("Turno actualizado correctamente");
      return;
    }

    if (turnoProcesadoRef.current === state.data.id) return;
    turnoProcesadoRef.current = state.data.id;
    invalidarDisponibilidadLocal(state.data.barberoId, obtenerFechaSola(state.data.horarioReservado));
    const nombreServicio =
      servicios.find((s) => s.id === selectedServicioId)?.nombre || "N/A";
    const nombreBarbero =
      barberos.find((b) => b.id === selectedBarberoId)?.nombre || "N/A";

    const nuevoTurno: TurnoCreado = {
      ...state.data,
      servicioNombre: nombreServicio,
      barberoNombre: nombreBarbero,
    };

    setIsOpen(false);
    formRef.current?.reset();
    setSelectedServicioId("");
    setSelectedBarberoId("");
    setSelectedUserId(puedeGestionarTurnos ? "" : session?.user?.id ?? "");
    setClienteNombre("");
    setClienteApellido("");
    setEstadoPago(ESTADOS_PAGO[0]);

    onTurnoCreado?.(state.data);

    if (nuevoTurno.estado === ESTADOS_TURNO[1]) {
      toast.success("Turno confirmado", {
        description: "No necesitás abonar una seña para este servicio.",
      });
      if (!onTurnoCreado) router.refresh();
      return;
    }

    if (puedeGestionarTurnos) {
      // El personal del panel carga el turno directamente: sin modal de seña ni WhatsApp
      toast.success("Turno creado correctamente");
      // TurnoManager ya actualiza el listado con el callback. El refresh queda
      // como respaldo para otros consumidores que no provean uno.
      if (!onTurnoCreado) router.refresh();
    } else {
      setTurnoCreado(nuevoTurno);
      setTransferenciaLista(false);
      setShowPagoModal(true);
    }
  }, [
    state,
    esEdicion,
    turnoInicial,
    servicios,
    barberos,
    selectedServicioId,
    selectedBarberoId,
    setIsOpen,
    setSelectedServicioId,
    setSelectedBarberoId,
    setSelectedUserId,
    setClienteNombre,
    setClienteApellido,
    setEstadoPago,
    setTurnoCreado,
    setTransferenciaLista,
    setShowPagoModal,
    session,
    puedeGestionarTurnos,
    onTurnoCreado,
    onTurnoActualizado,
    router,
  ]);

  return {
    esEdicion,
    puedeGestionarTurnos,
    ...datos,
    ...pago,
    state,
    formAction,
    formRef,
    sessionId,
  };
}
