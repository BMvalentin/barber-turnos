"use client";

import { useId, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import CamposFiltros from "./CamposFiltros";
import type { FilterState } from "@/hooks/useFiltrosServicios";

type PanelFiltrosProps = {
  filtros: FilterState;
  onCambiarFiltro: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  filtrosActivos: number;
};

export default function PanelFiltros({ filtros, onCambiarFiltro, filtrosActivos }: PanelFiltrosProps) {
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const idPanel = useId();
  const cantidadFiltros = filtrosActivos - Number(Boolean(filtros.search.trim()));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="relative min-w-0 flex-1 sm:max-w-md">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-texto-muted)]" />
          <input
            type="search"
            value={filtros.search}
            onChange={(evento) => onCambiarFiltro("search", evento.target.value)}
            placeholder="Buscar servicio"
            aria-label="Buscar por nombre o descripción"
            className="min-h-11 w-full rounded-xl border border-[var(--admin-border-fuerte)] bg-[var(--admin-surface)] pl-9 pr-2 text-base placeholder:text-[var(--admin-texto-muted)] sm:text-sm"
          />
        </label>
        <button
          type="button"
          aria-expanded={mostrarPanel}
          aria-controls={idPanel}
          onClick={() => setMostrarPanel((actual) => !actual)}
          className="admin-control shrink-0 aria-expanded:bg-[var(--page-primary-soft)] aria-expanded:text-[var(--admin-acento-suave-texto)]"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filtros
          {cantidadFiltros > 0 && (
            <span className="rounded-full bg-[var(--page-primary-soft)] px-1.5 text-xs text-[var(--admin-acento-suave-texto)]">{cantidadFiltros}</span>
          )}
        </button>
      </div>
      <div id={idPanel} hidden={!mostrarPanel}>
        <CamposFiltros filtros={filtros} onCambiarFiltro={onCambiarFiltro} />
      </div>
    </div>
  );
}
