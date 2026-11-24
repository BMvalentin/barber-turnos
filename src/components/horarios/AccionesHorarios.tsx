import { Save } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import CopiarHorario from "@/components/horarios/CopiarHorario";
import type { BarberoParaHorarios } from "@/types/horarios";

type Props = {
  destinos: BarberoParaHorarios[];
  mostrarCopia?: boolean;
  pendiente: boolean;
  hayEmpleadoSeleccionado: boolean;
  alCopiar: (barberoDestinoId: string) => void;
  alCancelar: () => void;
  alGuardar: () => void;
};

export function AccionesHorarios({
  destinos,
  mostrarCopia = true,
  pendiente,
  hayEmpleadoSeleccionado,
  alCopiar,
  alCancelar,
  alGuardar,
}: Props) {
  return (
    <div
      className={`flex flex-col gap-3 border-t border-[var(--admin-border)] p-4 sm:flex-row sm:items-center sm:px-6 ${mostrarCopia ? "sm:justify-between" : "sm:justify-end"}`}
    >
      {mostrarCopia && <CopiarHorario destinos={destinos} pendiente={pendiente} alCopiar={alCopiar} />}

      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <Button
          type="button"
          variant="ghost"
          onClick={alCancelar}
          className="admin-control"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={pendiente || !hayEmpleadoSeleccionado}
          onClick={alGuardar}
          className="admin-accion min-w-0"
        >
          <Save className="hidden size-4 sm:inline" aria-hidden="true" />
          {pendiente ? "Guardando…" : "Guardar horario"}
        </Button>
      </div>
    </div>
  );
}
