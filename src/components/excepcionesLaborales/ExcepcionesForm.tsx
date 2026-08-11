"use client";

import { useActionState, useEffect } from "react";
import { createExcepcion } from "@/actions/excepciones/crear.actions";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { ActionStateInicialSimple } from "@/types/action-state";
import type { Barbero } from "@/types/barbero";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";

const initialState = ActionStateInicialSimple;

type ExcepcionFormProps = {
  barberos: Barbero[];
};

export default function ExcepcionForm({ barberos }: ExcepcionFormProps) {
  const [state, formAction] = useActionState(createExcepcion, initialState);
  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Excepción creada",
    descripcionExito: "La excepción laboral se ha creado correctamente.",
    descripcionError: "Error al crear la excepción laboral",
    refrescar: true,
  });

  useEffect(() => {
    if (state.success || state.error) {
      void retroalimentar(state);
    }
  }, [state, retroalimentar]);

  return (
    <form action={formAction} className="space-y-4">
      {/* Motivo */}
      <div className="space-y-2">
        <label className="text-sm font-semibold" style={{ color: "var(--page-primary-80)" }}>
          Motivo <span style={{ color: "var(--page-primary)" }}>*</span>
        </label>
        <input
          type="text"
          name="motivo"
          required
          placeholder="Ej: Feriado Nacional"
          className="w-full rounded-lg px-3 py-2 bg-black/60 text-white focus:outline-none transition-all placeholder:text-zinc-500"
          style={{
            border: "1px solid var(--page-secondary-60)",
          }}
        />
      </div>

      {/* Adjudicar a Barbero */}
      <div className="space-y-2">
        <label className="text-sm font-semibold" style={{ color: "var(--page-primary-80)" }}>
          ¿A quién afecta?
        </label>
        <select
          name="barberoId"
          className="w-full rounded-lg px-3 py-2 bg-black/60 text-white focus:outline-none transition-all"
          style={{
            border: "1px solid var(--page-secondary-60)",
          }}
        >
          <option value="">🌎 Toda la barbería (Global)</option>
          {barberos.map((b) => (
            <option key={b.id} value={b.id}>
              💈 Barbero: {b.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha Desde */}
      <div className="space-y-2">
        <label className="text-sm font-semibold" style={{ color: "var(--page-primary-80)" }}>
          Desde <span style={{ color: "var(--page-primary)" }}>*</span>
        </label>
        <input
          type="datetime-local"
          name="desde"
          required
          className="w-full rounded-lg px-3 py-2 bg-black/60 text-white focus:outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          style={{
            border: "1px solid var(--page-secondary-60)",
          }}
        />
      </div>

      {/* Fecha Hasta */}
      <div className="space-y-2">
        <label className="text-sm font-semibold" style={{ color: "var(--page-primary-80)" }}>
          Hasta <span style={{ color: "var(--page-primary)" }}>*</span>
        </label>
        <input
          type="datetime-local"
          name="hasta"
          required
          className="w-full rounded-lg px-3 py-2 bg-black/60 text-white focus:outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          style={{
            border: "1px solid var(--page-secondary-60)",
          }}
        />
      </div>

      {state.error && (
        <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/50">
          {state.error}
        </div>
      )}

      <BotonSubmitFormStatus
        texto="Crear Excepción"
        claseAdicional="w-full shadow-md hover:opacity-95"
        estiloAdicional={{ border: "1px solid var(--page-secondary)" }}
      />
    </form>
  );
}