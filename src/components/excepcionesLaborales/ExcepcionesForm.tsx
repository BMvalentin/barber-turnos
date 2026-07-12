"use client";

import { useActionState, useEffect } from "react";
import { createExcepcion } from "@/actions/excepcionesLaborales.actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { toast } from "@/components/ui/use-toast";

const initialState = {
  success: false,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
    >
      {pending ? "Guardando..." : "Crear Excepción"}
    </Button>
  );
}

type Barbero = {
  id: string;
  nombre: string;
};

export default function ExcepcionForm({ barberos }: { barberos: Barbero[] }) {
  const router = useRouter();
  const [state, formAction] = useActionState(createExcepcion, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Excepción creada",
        description: "La excepción laboral se ha creado correctamente.",
        variant: "default",
        duration: 4000,
      });
      router.refresh();
    } else if (state.error) {
      toast({
        title: "Error",
        description: state.error || "Error al crear la excepción laboral",
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {/* Motivo */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-amber-200/70">
          Motivo <span className="text-amber-500">*</span>
        </label>
        <input
          type="text"
          name="motivo"
          required
          placeholder="Ej: Feriado Nacional"
          className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder:text-amber-200/30"
        />
      </div>

      {/* Adjudicar a Barbero */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-amber-200/70">
          ¿A quién afecta?
        </label>
        <select
          name="barberoId"
          className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
        <label className="text-sm font-semibold text-amber-200/70">
          Desde <span className="text-amber-500">*</span>
        </label>
        <input
          type="datetime-local"
          name="desde"
          required
          className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>

      {/* Fecha Hasta */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-amber-200/70">
          Hasta <span className="text-amber-500">*</span>
        </label>
        <input
          type="datetime-local"
          name="hasta"
          required
          className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>

      {state.error && (
        <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/50">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}