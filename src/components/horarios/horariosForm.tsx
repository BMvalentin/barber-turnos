"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  createMargenLaboral,
  updateMargenLaboral,
  type ActionState,
} from "@/actions/margenesHorario.actions";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

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

const initialState: ActionState = {
  success: false,
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-amber-600 hover:bg-amber-700 text-white"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isEdit ? "Actualizar" : "Crear"}
        </>
      )}
    </Button>
  );
}

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

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Horario guardado",
        description: "El horario se ha guardado correctamente.",
        variant: "default",
        duration: 4000,
      });
      onSuccess?.();
    } else if (state.error) {
      toast({
        title: "Error",
        description: state.error || "Error al guardar el horario",
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="diaId" value={diaId} />
      {initialData && <input type="hidden" name="id" value={initialData.id} />}

      {/* HORAS */}
      <div className="space-y-1">
        <p className="text-xs text-amber-200/60 font-medium">Apertura → Cierre</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="time"
            name="desde"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="time"
            name="hasta"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* ESTADO */}
      <label className="flex items-center gap-2 text-amber-200/70">
        <input
          type="checkbox"
          name="estado"
          defaultChecked={initialData?.estado ?? true}
          value="true"
          className="w-4 h-4 text-amber-500"
        />
        Activo
      </label>

      {/* ERROR del servidor */}
      {state.error && (
        <p className="text-red-400 text-sm">{state.error}</p>
      )}

      {/* BOTONES */}
      <div className="flex justify-end gap-2 pt-3 border-t border-amber-900/30">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-black/60 text-white border border-amber-900/30 hover:bg-amber-500/10 hover:text-amber-400 transition-all"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancelar
        </Button>

        <SubmitButton isEdit={!!initialData} />
      </div>
    </form>
  );
}