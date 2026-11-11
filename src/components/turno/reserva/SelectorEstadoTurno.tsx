"use client";

import type { PropsSelectorEstadoTurno } from "@/components/turno/reserva/tipos";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";
import { ESTADOS_TURNO } from "@/lib/constants";

type EstadoTurno = (typeof ESTADOS_TURNO)[number];

const ETIQUETAS_ESTADOS: Record<EstadoTurno, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

/* El administrador solo gestiona manualmente el paso entre estos dos estados.
   COMPLETADO y CANCELADO no se ofrecen como transición para no duplicar los
   flujos dedicados, pero se muestran cuando ya son el estado persistido. */
const ESTADOS_EDITABLES: EstadoTurno[] = [ESTADOS_TURNO[0], ESTADOS_TURNO[1]];

function esEstadoEditable(estado: EstadoTurno): boolean {
  return ESTADOS_EDITABLES.includes(estado);
}

export default function SelectorEstadoTurno({
  valor,
  onChange,
}: PropsSelectorEstadoTurno) {
  const opciones: OpcionDesplegable<EstadoTurno>[] = (esEstadoEditable(valor)
    ? [...ESTADOS_EDITABLES]
    : [valor, ...ESTADOS_EDITABLES]).map((estado) => ({
      valor: estado,
      etiqueta: ETIQUETAS_ESTADOS[estado],
    }));

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="estado-turno-reserva"
        className="text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]"
      >
        Estado del turno
      </label>
      <SelectorDesplegable
        id="estado-turno-reserva"
        opciones={opciones}
        valor={valor}
        onChange={onChange}
      />
    </div>
  );
}
