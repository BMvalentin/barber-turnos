"use client";

import type { DiaLaboral } from "@/types/barbero";
import { REVERSE_MAPA_DIA_SEMANA_DB } from "@/lib/constants";
import SelectorCheckboxColapsable from "@/components/ui/SelectorCheckboxColapsable";

type Props = {
  abierto: boolean;
  onAlternarAbierto: () => void;
  seleccionados: string[];
  diasLaborales: DiaLaboral[];
  onAlternarSeleccion: (id: string) => void;
};

export default function SelectorHorarios({
  abierto,
  onAlternarAbierto,
  seleccionados,
  diasLaborales,
  onAlternarSeleccion,
}: Props) {
  const grupos = [...diasLaborales]
    .filter((dia) => dia.margenes.length > 0)
    .sort(
      (a, b) =>
        REVERSE_MAPA_DIA_SEMANA_DB[a.dia] - REVERSE_MAPA_DIA_SEMANA_DB[b.dia]
    )
    .map((dia) => ({
      titulo: dia.dia,
      opciones: [...dia.margenes]
        .sort((a, b) => a.desde.localeCompare(b.desde))
        .map((margen) => ({
          valor: margen.id,
          etiqueta: `${margen.desde} - ${margen.hasta}`,
        })),
    }));

  return (
    <SelectorCheckboxColapsable
      titulo="Horarios disponibles"
      abierto={abierto}
      onAlternarAbierto={onAlternarAbierto}
      seleccionados={seleccionados}
      onAlternarSeleccion={onAlternarSeleccion}
      grupos={grupos}
      mensajeVacio="No seleccionaste horarios"
      maxAltura="max-h-80"
    />
  );
}
