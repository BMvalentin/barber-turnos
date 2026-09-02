"use client";

import { Scissors } from "lucide-react";
import Paginacion from "./Paginacion";
import ServicioRow from "./ServicioRow";
import EmptyState from "@/components/ui/EmptyState";
import type { Servicio } from "@/types/servicio";

type ServicioTablaProps = {
  servicios: Servicio[];
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
};

export default function ServicioTabla({
  servicios,
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
}: ServicioTablaProps) {
  if (estaVacio) {
    return (
      <EmptyState
        icono={<Scissors />}
        mensaje={
          sinServicios
            ? "No hay servicios disponibles. Comienza agregando uno."
            : "No hay servicios que coincidan con los filtros aplicados."
        }
        claseContenedor="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-12"
        claseIcono="h-12 w-12 text-[var(--admin-texto-muted)] opacity-50"
        claseMensaje="text-[var(--admin-texto-muted)]"
        accion={
          hayFiltros ? (
            <button
              onClick={onLimpiarFiltros}
              className="text-[10px] font-bold uppercase tracking-wider hover:underline"
              style={{ color: "var(--page-primary-tinta)" }}
            >
              Limpiar filtros
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
      <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] text-[11px] font-bold text-[var(--admin-texto-secundario)] uppercase tracking-wider">
        <div className="col-span-6">Servicio</div>
        <div className="col-span-2 text-center">Duración</div>
        <div className="col-span-2 text-center">Precio</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      <div className="divide-y divide-[var(--admin-border)]">
        {servicios.map((servicio) => (
          <ServicioRow
            key={servicio.id}
            servicio={servicio}
            onEliminar={onEliminar}
          />
        ))}
      </div>

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
