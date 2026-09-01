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
          className="bg-[var(--page-primary)] text-[var(--page-primary-foreground)] hover:bg-[var(--page-primary-hover)]"
        >
          <Plus className="h-4 w-4" />
          Nuevo horario
        </Button>
      )}
    </div>
  );
}
