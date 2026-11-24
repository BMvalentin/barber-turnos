"use client";

import { Scissors } from "lucide-react";
import Paginacion from "./Paginacion";
import ServicioRow from "./ServicioRow";
import EmptyState from "@/components/ui/EmptyState";
import type { Servicio, ServicioCreado } from "@/types/servicio";

type ServicioTablaProps = {
  servicios: Servicio[];
  puedeGestionar: boolean;
  onEliminar: (id: string) => void;
  estaVacio: boolean;
  sinServicios: boolean;
  hayFiltros: boolean;
  onLimpiarFiltros: () => void;
  paginaActual: number;
  totalPaginas: number;
  desde: number;
  hasta: number;
  totalResultados: number;
  onCambiarPagina: (pagina: number) => void;
  onServicioActualizado?: (servicio: ServicioCreado) => void;
};

export default function ServicioTabla({
  servicios,
  puedeGestionar,
  onEliminar,
  estaVacio,
  sinServicios,
  hayFiltros,
  onLimpiarFiltros,
  paginaActual,
  totalPaginas,
  desde,
  hasta,
  totalResultados,
  onCambiarPagina,
  onServicioActualizado,
}: ServicioTablaProps) {
  if (estaVacio) {
    return (
      <EmptyState
        icono={<Scissors />}
        mensaje={
          sinServicios
            ? puedeGestionar
              ? "Todavía no hay servicios. Agregá el primero con «Nuevo servicio»."
              : "Todavía no hay servicios para consultar."
            : "No hay servicios que coincidan con los filtros aplicados."
        }
        claseContenedor="admin-card px-4 py-10"
        claseIcono="grid size-10 place-items-center rounded-xl bg-[var(--page-primary-soft)] [&_svg]:size-5"
        estiloIcono={{ color: "var(--admin-acento-suave-texto)" }}
        claseMensaje="text-[var(--admin-texto-muted)]"
        accion={
          hayFiltros ? (
            <button
              type="button"
              onClick={onLimpiarFiltros}
              className="admin-control"
            >
              Limpiar filtros
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className={`lg:rounded-2xl lg:border lg:border-[var(--admin-border)] lg:bg-[var(--admin-surface)] ${puedeGestionar ? "[--servicio-columnas:minmax(0,1fr)_7ch_8rem_6.25rem]" : "[--servicio-columnas:minmax(0,1fr)_7ch_8rem]"}`}>
      <div aria-hidden="true" className="hidden gap-4 rounded-t-2xl border-b border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-4 py-3 text-xs font-medium text-[var(--admin-texto-muted)] lg:grid lg:grid-cols-[var(--servicio-columnas)]">
        <span>Servicio</span>
        <span className="text-right">Duración</span>
        <span className="text-right">Precio</span>
        {puedeGestionar && <span className="text-right">Acciones</span>}
      </div>

      <ul className="space-y-2 lg:space-y-0">
        {servicios.map((servicio) => (
          <ServicioRow
            key={servicio.id}
            servicio={servicio}
            puedeGestionar={puedeGestionar}
            onEliminar={onEliminar}
            onServicioActualizado={onServicioActualizado}
          />
        ))}
      </ul>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        desde={desde}
        hasta={hasta}
        totalResultados={totalResultados}
        onCambiarPagina={onCambiarPagina}
      />
    </div>
  );
}
