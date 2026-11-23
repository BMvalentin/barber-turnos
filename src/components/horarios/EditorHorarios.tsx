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
  esEmpleado: boolean;
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
  esEmpleado,
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
    <div className="grid min-w-0 gap-4">
      {!esEmpleado && (
        <section className="admin-card p-4 sm:p-6" aria-label="Seleccionar un integrante del equipo">
          <SelectorEmpleado barberos={barberos} valor={barberoId} alCambiar={alCambiarBarbero} />
        </section>
      )}
      <section ref={tarjetaRef} className="admin-card min-w-0 scroll-mt-24" aria-labelledby="titulo-semana-laboral">
        <header className="px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
          <h2 id="titulo-semana-laboral" className="text-base font-semibold text-[var(--admin-texto-primario)]">
            {esEmpleado ? "Mi disponibilidad semanal" : "Disponibilidad semanal"}
          </h2>
          <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">Podés definir más de un horario por día.</p>
        </header>
        <TablaDiasBarbero
          key={barberoId}
          dias={dias}
          valores={valores}
          alCambiar={alCambiar}
          alAlternarTrabajo={alAlternarTrabajo}
          alAgregarRango={alAgregarRango}
          alQuitarRango={alQuitarRango}
          alEliminarDia={alEliminarDia}
        />
        <AccionesHorarios
          destinos={destinos}
          mostrarCopia={!esEmpleado}
          pendiente={pendiente}
          hayEmpleadoSeleccionado={Boolean(barberoId)}
          alCopiar={alCopiar}
          alCancelar={alCancelar}
          alGuardar={alGuardar}
        />
      </section>
    </div>
  );
}
