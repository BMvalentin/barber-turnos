"use client";

import type { ServicioOpcion } from "@/types/barbero";
import SelectorCheckboxColapsable from "@/components/ui/SelectorCheckboxColapsable";

type Props = {
  abierto: boolean;
  onAlternarAbierto: () => void;
  seleccionados: string[];
  opciones: ServicioOpcion[];
  onAlternarSeleccion: (id: string) => void;
};

export default function SelectorServicios({
  abierto,
  onAlternarAbierto,
  seleccionados,
  opciones,
  onAlternarSeleccion,
}: Props) {
  return (
    <SelectorCheckboxColapsable
      titulo="Servicios disponibles"
      abierto={abierto}
      onAlternarAbierto={onAlternarAbierto}
      seleccionados={seleccionados}
      onAlternarSeleccion={onAlternarSeleccion}
      opciones={opciones.map((servicio) => ({
        valor: servicio.id,
        etiqueta: servicio.nombre,
      }))}
      mensajeVacio="No seleccionaste ningún servicio"
      mensajeSinOpciones="No hay servicios cargados"
      maxAltura="max-h-60"
    />
  );
}
