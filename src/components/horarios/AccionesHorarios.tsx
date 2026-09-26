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
      className={`mt-5 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center ${mostrarCopia ? "sm:justify-between" : "sm:justify-end"}`}
      style={{ borderColor: "var(--admin-border)" }}
    >
      {mostrarCopia && <CopiarHorario destinos={destinos} pendiente={pendiente} alCopiar={alCopiar} />}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="ghost"
          onClick={alCancelar}
          className="border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] text-[var(--admin-texto-secundario)] shadow-sm hover:border-[var(--admin-border-fuerte)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={pendiente || !hayEmpleadoSeleccionado}
          onClick={alGuardar}
          className="bg-[var(--page-primary)] font-semibold text-[var(--page-primary-foreground)] shadow-sm hover:-translate-y-0.5 hover:bg-[var(--page-primary-hover)] hover:shadow-md active:translate-y-0"
        >
          <Save className="h-4 w-4" />
          Guardar horario
        </Button>
      </div>
    </div>
  );
}
