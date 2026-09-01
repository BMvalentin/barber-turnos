import type { RefObject } from "react";
import { AccionesHorarios } from "@/components/horarios/AccionesHorarios";
import SelectorEmpleado from "@/components/horarios/SelectorEmpleado";
import { TablaDiasBarbero, type EstadoDiaEditor } from "@/components/horarios/TablaDiasBarbero";
import type { BarberoParaHorarios } from "@/types/horarios";

type DiaTabla = {
  diaId: string;
  dia: number;
  nombre: string;
};

type Props = {
  tarjetaRef: RefObject<HTMLElement | null>;
  barberos: BarberoParaHorarios[];
  barberoId: string;
  dias: DiaTabla[];
  valores: Record<string, EstadoDiaEditor>;
  destinos: BarberoParaHorarios[];
  pendiente: boolean;
  alCambiarBarbero: (id: string) => void;
  alCambiar: (diaId: string, indiceRango: number, campo: "desde" | "hasta", valor: string) => void;
  alAlternarTrabajo: (diaId: string, trabaja: boolean) => void;
  alAgregarRango: (diaId: string) => void;
  alQuitarRango: (diaId: string, indiceRango: number) => void;
  alEliminarDia: (diaId: string, asignacionIds: string[]) => void;
  alCopiar: (barberoDestinoId: string) => void;
  alCancelar: () => void;
  alGuardar: () => void;
};

export function EditorHorarios({
  tarjetaRef,
  barberos,
  barberoId,
  dias,
  valores,
  destinos,
  pendiente,
  alCambiarBarbero,
  alCambiar,
  alAlternarTrabajo,
  alAgregarRango,
  alQuitarRango,
  alEliminarDia,
  alCopiar,
  alCancelar,
  alGuardar,
}: Props) {
  return (
    <section
      ref={tarjetaRef}
      className="rounded-xl bg-[var(--admin-surface)] p-6"
      style={{ border: "1px solid var(--admin-border)" }}
    >
      <h2 className="text-lg font-semibold text-[var(--admin-texto-primario)]">
        Registrar / Editar horario
      </h2>
      <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
        Seleccioná el empleado y configurá sus días de trabajo.
      </p>

      <div className="mt-5">
        <SelectorEmpleado barberos={barberos} valor={barberoId} alCambiar={alCambiarBarbero} />
      </div>

      <div className="mt-5">
        <TablaDiasBarbero
          dias={dias}
          valores={valores}
          alCambiar={alCambiar}
          alAlternarTrabajo={alAlternarTrabajo}
          alAgregarRango={alAgregarRango}
          alQuitarRango={alQuitarRango}
          alEliminarDia={alEliminarDia}
        />
      </div>

      <AccionesHorarios
        destinos={destinos}
        pendiente={pendiente}
        hayEmpleadoSeleccionado={Boolean(barberoId)}
        alCopiar={alCopiar}
        alCancelar={alCancelar}
        alGuardar={alGuardar}
      />
    </section>
  );
}
