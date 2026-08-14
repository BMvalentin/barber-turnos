"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { createMargenLaboral } from "@/actions/horarios/crear-margen.actions";
import { updateMargenLaboral } from "@/actions/horarios/actualizar-margen.actions";
import type { ActionState } from "@/types/action-state";
import { ActionStateInicialSimple } from "@/types/action-state";
import type { MargenLaboralCreado } from "@/types/horarios";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { CheckCircle2, XCircle } from "lucide-react";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";

type HorariosFormProps = {
  diaId: string;
  margenesExistentes?: { id: string; desde: string; hasta: string }[];
  initialData?: {
    id: string;
    estado: boolean;
    desde: string;
    hasta: string;
  } | null;
  onSuccess?: () => void;
  onCancel: () => void;
};

const initialState: ActionState<MargenLaboralCreado> = ActionStateInicialSimple;

export function HorariosForm({
  diaId,
  initialData,
  onSuccess,
  onCancel,
}: HorariosFormProps) {
  const action = initialData ? updateMargenLaboral : createMargenLaboral;
  const [state, formAction] = useActionState(action, initialState);

  const [desde, setDesde] = useState(initialData?.desde || "08:00");
  const [hasta, setHasta] = useState(initialData?.hasta || "17:00");

  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Horario guardado",
    descripcionExito: "El horario se ha guardado correctamente.",
    descripcionError: "Error al guardar el horario",
    onExito: onSuccess,
  });

  useEffect(() => {
    if (state.success || state.error) {
      void retroalimentar(state);
    }
  }, [state, retroalimentar]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="diaId" value={diaId} />
      {initialData && <input type="hidden" name="id" value={initialData.id} />}

      {/* HORAS */}
      <div className="space-y-1">
        <p className="text-xs font-medium" style={{ color: "var(--page-primary-80)" }}>
          Apertura → Cierre
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="time"
            name="desde"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-lg px-3 py-2 bg-black/60 text-white focus:outline-none transition-all"
            style={{
              border: `1px solid var(--page-secondary-60)`,
            }}
          />
          <input
            type="time"
            name="hasta"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-lg px-3 py-2 bg-black/60 text-white focus:outline-none transition-all"
            style={{
              border: `1px solid var(--page-secondary-60)`,
            }}
          />
        </div>
      </div>

      {/* ESTADO */}
      <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
        <input
          type="checkbox"
          name="estado"
          defaultChecked={initialData?.estado ?? true}
          value="true"
          className="w-4 h-4 rounded accent-current"
          style={{ accentColor: "var(--page-primary)" }}
        />
        Activo
      </label>

      {/* ERROR del servidor */}
      {state.error && (
        <p className="text-red-400 text-sm">{state.error}</p>
      )}

      {/* BOTONES */}
      <div 
        className="flex justify-end gap-2 pt-3 border-t"
        style={{ borderColor: "var(--page-secondary-40)" }}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancelar
        </Button>

        <BotonSubmitFormStatus
          texto={
            <>
              <CheckCircle2 className="h-4 w-4" />
              {initialData ? "Actualizar" : "Crear"}
            </>
          }
          textoMientrasCarga="Guardando..."
          claseAdicional="shadow-md hover:opacity-95"
          estiloAdicional={{ border: "1px solid var(--page-secondary)" }}
        />
      </div>
    </form>
  );
}