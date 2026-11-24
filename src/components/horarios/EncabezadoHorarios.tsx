"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button/Button";

type Props = {
  esEmpleado: boolean;
  hayPerfiles: boolean;
  alNuevoHorario: () => void;
};

export default function EncabezadoHorarios({ esEmpleado, hayPerfiles, alNuevoHorario }: Props) {
  return (
    <header className="admin-encabezado">
      <div>
        <h1>
          {esEmpleado ? "Mis horarios" : "Horarios laborales"}
        </h1>
        <p>
          {esEmpleado
            ? "Configurá tus días y horarios de atención."
            : "Configurá los días de atención y los horarios del equipo."}
        </p>
      </div>
      {hayPerfiles && (
        <Button
          type="button"
          onClick={alNuevoHorario}
          className="admin-accion w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {esEmpleado ? "Configurar horario" : "Nuevo horario"}
        </Button>
      )}
    </header>
  );
}
