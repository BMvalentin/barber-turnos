"use client";

import { useState } from "react";
import { cancelTurno } from "@/actions/sesion/cancelar-turno.actions";
import { completedTurno } from "@/actions/turnos/completar.actions";
import { confirmarTurno } from "@/actions/turnos/confirmar.actions";
import { ESTADOS_TURNO } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";

type AccionConfirmacion = "cancelar" | "completar" | "confirmar";

type Parametros = {
  alRetroalimentar: (estado: ActionState, titulo?: string, descripcion?: string) => Promise<ActionState>;
  alActualizarEstado: (id: string, nuevoEstado: string) => void;
};

export function useConfirmacionTurno({
  alRetroalimentar,
  alActualizarEstado,
}: Parametros) {
  const [mostrarConfirmacion, establecerMostrarConfirmacion] = useState(false);
  const [accionConfirmacion, establecerAccionConfirmacion] =
    useState<AccionConfirmacion | null>(null);
  const [turnoIdConfirmacion, establecerTurnoIdConfirmacion] = useState<string | null>(null);

  const solicitarAccion = (accion: AccionConfirmacion, id: string) => {
    establecerAccionConfirmacion(accion);
    establecerTurnoIdConfirmacion(id);
    establecerMostrarConfirmacion(true);
  };

  const cancelarConfirmacion = () => {
    establecerMostrarConfirmacion(false);
    establecerAccionConfirmacion(null);
    establecerTurnoIdConfirmacion(null);
  };

  const confirmarAccion = async () => {
    if (!turnoIdConfirmacion || !accionConfirmacion) return;

    try {
      if (accionConfirmacion === "cancelar") {
        const resultado = await cancelTurno(turnoIdConfirmacion);
        await alRetroalimentar(
          resultado,
          "Turno cancelado",
          "El turno se ha cancelado correctamente.",
        );
        if (resultado.success) alActualizarEstado(turnoIdConfirmacion, ESTADOS_TURNO[3]);
        return;
      }

      if (accionConfirmacion === "completar") {
        const datosFormulario = new FormData();
        datosFormulario.append("id", turnoIdConfirmacion);
        const resultado = await completedTurno({ success: false }, datosFormulario);
        await alRetroalimentar(
          resultado,
          "Turno completado",
          "El turno se ha marcado como completado.",
        );
        if (resultado.success) alActualizarEstado(turnoIdConfirmacion, ESTADOS_TURNO[2]);
        return;
      }

      const resultado = await confirmarTurno(turnoIdConfirmacion);
      await alRetroalimentar(
        resultado,
        "Turno confirmado",
        "El turno se ha confirmado correctamente.",
      );
      if (resultado.success) alActualizarEstado(turnoIdConfirmacion, ESTADOS_TURNO[1]);
    } catch {
      await alRetroalimentar({ success: false, error: "No se pudo procesar la acción." });
    } finally {
      cancelarConfirmacion();
    }
  };

  return {
    mostrarConfirmacion,
    accionConfirmacion,
    solicitarCancelar: (id: string) => solicitarAccion("cancelar", id),
    solicitarCompletar: (id: string) => solicitarAccion("completar", id),
    solicitarConfirmar: (id: string) => solicitarAccion("confirmar", id),
    cancelarConfirmacion,
    confirmarAccion,
  };
}
