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
  primaryColor: string;
  secondaryColor: string;
};

const initialState: ActionState = {
  success: false,
};

function SubmitButton({ isEdit, primaryColor, secondaryColor }: { isEdit: boolean; primaryColor: string; secondaryColor: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="text-white shadow-md hover:opacity-95 transition-all"
      style={{
        backgroundColor: primaryColor,
        border: `1px solid ${secondaryColor}`,
      }}
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
  primaryColor,
  secondaryColor,
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
        <p className="text-xs font-medium" style={{ color: `${primaryColor}cc` }}>
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
              border: `1px solid ${secondaryColor}60`,
            }}
          />
          <input
            type="time"
            name="hasta"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-lg px-3 py-2 bg-black/60 text-white focus:outline-none transition-all"
            style={{
              border: `1px solid ${secondaryColor}60`,
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
          style={{ accentColor: primaryColor }}
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
        style={{ borderColor: `${secondaryColor}40` }}
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

        <SubmitButton 
          isEdit={!!initialData} 
          primaryColor={primaryColor} 
          secondaryColor={secondaryColor} 
        />
      </div>
    </form>
  );
}