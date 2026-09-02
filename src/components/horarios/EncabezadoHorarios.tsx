"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button/Button";

type Props = {
  hayEmpleados: boolean;
  alNuevoHorario: () => void;
};

export default function EncabezadoHorarios({ hayEmpleados, alNuevoHorario }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
          Horarios laborales
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Gestiona los horarios de trabajo de tus empleados.
        </p>
      </div>
      {hayEmpleados && (
        <Button
          type="button"
          onClick={alNuevoHorario}
          className="bg-[var(--page-primary)] font-semibold text-[var(--page-primary-foreground)] shadow-sm hover:-translate-y-0.5 hover:bg-[var(--page-primary-hover)] hover:shadow-md active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo horario
        </Button>
      )}
    </div>
  );
}
