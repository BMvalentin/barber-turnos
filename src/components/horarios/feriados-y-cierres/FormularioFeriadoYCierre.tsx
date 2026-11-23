"use client";

import { useActionState, useEffect, useMemo } from "react";
import { createExcepcion } from "@/actions/excepciones/crear.actions";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { ActionStateInicialSimple } from "@/types/action-state";
import type { BarberoParaSelector } from "@/types/barbero";

type FormularioFeriadoYCierreProps = {
  barberos: BarberoParaSelector[];
};

const CLASE_CAMPO =
  "min-h-11 w-full min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 text-[var(--admin-texto-primario)] outline-none placeholder:text-[var(--admin-texto-muted)] focus:ring-2 focus:ring-[var(--page-focus-ring)]";

export function FormularioFeriadoYCierre({ barberos }: FormularioFeriadoYCierreProps) {
  const [estado, accionFormulario] = useActionState(createExcepcion, ActionStateInicialSimple);
  const opcionesBarbero = useMemo<OpcionDesplegable<string>[]>(() => [
    { valor: "", etiqueta: "Toda la barbería" },
    ...barberos.map((barbero) => ({
      valor: barbero.id,
      etiqueta: barbero.nombre ?? "Profesional sin nombre",
    })),
  ], [barberos]);
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
    <form action={accionFormulario} className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] 2xl:items-end">
      <label className="grid gap-2 text-sm font-medium text-[var(--admin-texto-primario)]">
        Motivo
        <input
          required
          name="motivo"
          placeholder="Ej.: Feriado nacional"
          className={CLASE_CAMPO}
        />
      </label>
      <div className="grid gap-2 text-sm font-medium text-[var(--admin-texto-primario)]">
        <label htmlFor="barbero-excepcion">Afecta a</label>
        <SelectorDesplegable
          id="barbero-excepcion"
          name="barberoId"
          opciones={opcionesBarbero}
          claseBoton="min-h-11 rounded-lg px-3"
        />
      </div>
      <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--admin-texto-primario)]">
        Desde
        <input
          required
          type="datetime-local"
          name="desde"
          className={CLASE_CAMPO}
        />
      </label>
      <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--admin-texto-primario)]">
        Hasta
        <input
          required
          type="datetime-local"
          name="hasta"
          className={CLASE_CAMPO}
        />
      </label>
      <BotonSubmitFormStatus texto="Agregar cierre" claseAdicional="admin-accion sm:col-span-2 sm:justify-self-end 2xl:col-span-1" />
    </form>
  );
}
