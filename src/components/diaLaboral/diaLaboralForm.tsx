"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { create, update, type ActionState } from "@/actions/diaLaboral.actions";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Loader2, XCircle } from "lucide-react";

type DiaLaboralFormProps = {
  initialData?: {
    id: string;
    estado: boolean;
    dia: number;
  } | null;
  onSuccess?: () => void;
  onCancel: () => void;
};

const DIAS_SEMANA = [
  { value: 0, label: "Domingo", icon: "🟣" },
  { value: 1, label: "Lunes", icon: "🔵" },
  { value: 2, label: "Martes", icon: "🟢" },
  { value: 3, label: "Miércoles", icon: "🟡" },
  { value: 4, label: "Jueves", icon: "🟠" },
  { value: 5, label: "Viernes", icon: "🔴" },
  { value: 6, label: "Sábado", icon: "🟣" },
];

const initialState: ActionState = {
  success: false,
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="min-w-[120px] bg-cyan-500 hover:bg-cyan-600 text-white"
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

export function DiaLaboralForm({
  initialData,
  onSuccess,
  onCancel,
}: DiaLaboralFormProps) {
  const action = initialData ? update : create;
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(
        initialData
          ? "Día laboral actualizado correctamente"
          : "Día laboral creado correctamente"
      );
      onSuccess?.();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, initialData, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      {initialData && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      <div className="space-y-3">
        <Label htmlFor="dia" className="text-base font-semibold flex items-center gap-2 text-cyan-700">
          <Calendar className="h-4 w-4 text-cyan-600" />
          Día de la Semana
        </Label>
        <Select
          name="dia"
          defaultValue={initialData?.dia.toString()}
          required
        >
          <SelectTrigger 
            id="dia" 
            className="border-2 border-cyan-300 h-12 text-base hover:border-cyan-500 transition-colors bg-white text-cyan-700"
          >
            <SelectValue placeholder="Selecciona un día" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {DIAS_SEMANA.map((d) => (
              <SelectItem 
                key={d.value} 
                value={d.value.toString()}
                className="text-base py-3 text-cyan-700"
              >
                <span className="flex items-center gap-2">
                  <span>{d.icon}</span>
                  <span className="font-medium">{d.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold text-cyan-700">Estado del Día</Label>
        <div className="flex items-center justify-between p-5 border-2 border-cyan-300 rounded-lg bg-gradient-to-br from-cyan-50/50 to-white hover:border-cyan-500 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="estado" className="text-base font-medium cursor-pointer text-cyan-700">
                Día Laboral
              </Label>
            </div>
            <div className="text-sm text-cyan-600/80">
              {initialData?.estado ?? true ? (
                <span className="flex items-center gap-1 text-cyan-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Día habilitado para trabajo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-cyan-600/60">
                  <XCircle className="h-3 w-3" />
                  Día deshabilitado
                </span>
              )}
            </div>
          </div>
          <Switch
            id="estado"
            name="estado"
            defaultChecked={initialData?.estado ?? true}
            value="true"
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border-2 border-red-300 p-4 rounded-lg">
          <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p>{state.error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t-2 border-cyan-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="min-w-[120px] border-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <SubmitButton isEdit={!!initialData} />
      </div>
    </form>
  );
}