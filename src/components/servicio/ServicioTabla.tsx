"use client";

import { Scissors } from "lucide-react";
import Paginacion from "./Paginacion";
import ServicioRow from "./ServicioRow";
import EmptyState from "@/components/ui/EmptyState";
import type { Servicio } from "@/types/servicio";
import type { Barbero } from "@/types/barbero";

type ServicioTablaProps = {
  servicios: Servicio[];
  barberos: Barbero[];
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
  barberos,
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
        claseContenedor="bg-black/70 border border-[#2C261D] rounded-xl p-12"
        claseIcono="h-12 w-12 text-[#8E8675] opacity-50"
        claseMensaje="text-[#8E8675]"
        accion={
          hayFiltros ? (
            <button
              onClick={onLimpiarFiltros}
              className="text-[10px] font-bold uppercase tracking-wider hover:underline"
              style={{ color: "var(--page-primary)" }}
            >
              Limpiar filtros
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="bg-black/70 border border-[#2C261D] rounded-xl overflow-hidden">
      <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b border-[#2C261D] bg-[#14110C]/50 text-[11px] font-bold text-[#8E8675] uppercase tracking-wider">
        <div className="col-span-6">Servicio</div>
        <div className="col-span-2 text-center">Duración</div>
        <div className="col-span-2 text-center">Precio</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      <div className="divide-y divide-[#2C261D]">
        {servicios.map((servicio) => (
          <ServicioRow
            key={servicio.id}
            servicio={servicio}
            barberos={barberos}
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