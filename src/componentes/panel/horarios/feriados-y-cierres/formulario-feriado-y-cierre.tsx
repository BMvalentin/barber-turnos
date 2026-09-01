"use client";

import { useActionState, useEffect } from "react";
import { createExcepcion } from "@/actions/excepciones/crear.actions";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { ActionStateInicialSimple } from "@/types/action-state";
import type { Barbero } from "@/types/barbero";

type FormularioFeriadoYCierreProps = {
  barberos: Barbero[];
};

export function FormularioFeriadoYCierre({ barberos }: FormularioFeriadoYCierreProps) {
  const [estado, accionFormulario] = useActionState(createExcepcion, ActionStateInicialSimple);
  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Cierre agregado",
    descripcionExito: "El feriado o cierre se guardó correctamente.",
    descripcionError: "No se pudo guardar el feriado o cierre.",
    refrescar: true,
  });

  useEffect(() => {
    if (estado.success || estado.error) {
      void retroalimentar(estado);
    }
  }, [estado, retroalimentar]);

  return (
    <form action={accionFormulario} className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
      <label className="grid gap-2 text-sm font-medium text-[var(--admin-texto-primario)]">
        Motivo
        <input
          required
          name="motivo"
          placeholder="Ej.: Feriado nacional"
          className="h-10 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] outline-none transition focus:border-[var(--page-primary)] focus:ring-2 focus:ring-[var(--page-focus-ring)]"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--admin-texto-primario)]">
        Afecta a
        <select
          name="barberoId"
          className="h-10 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 text-[var(--admin-texto-primario)] outline-none transition focus:border-[var(--page-primary)] focus:ring-2 focus:ring-[var(--page-focus-ring)]"
        >
          <option value="">Toda la barbería</option>
          {barberos.map((barbero) => (
            <option key={barbero.id} value={barbero.id}>
              {barbero.nombre ?? "Profesional sin nombre"}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--admin-texto-primario)]">
        Desde
        <input
          required
          type="datetime-local"
          name="desde"
          className="h-10 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 text-[var(--admin-texto-primario)] outline-none transition focus:border-[var(--page-primary)] focus:ring-2 focus:ring-[var(--page-focus-ring)]"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-[var(--admin-texto-primario)]">
        Hasta
        <input
          required
          type="datetime-local"
          name="hasta"
          className="h-10 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 text-[var(--admin-texto-primario)] outline-none transition focus:border-[var(--page-primary)] focus:ring-2 focus:ring-[var(--page-focus-ring)]"
        />
      </label>
      <BotonSubmitFormStatus texto="Agregar cierre" claseAdicional="h-10 px-4" />
    </form>
  );
}
