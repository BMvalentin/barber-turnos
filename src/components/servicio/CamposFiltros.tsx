"use client";

import { ChevronDown, Search } from "lucide-react";
import type { FilterState } from "@/hooks/useFiltrosServicios";

type CamposFiltrosProps = {
  filtros: FilterState;
  onCambiarFiltro: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
};

export default function CamposFiltros({
  filtros,
  onCambiarFiltro,
}: CamposFiltrosProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      <div>
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)] mb-2">
          Buscar
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--admin-texto-muted)]" />
          <input
            type="text"
            value={filtros.search}
            onChange={(e) => onCambiarFiltro("search", e.target.value)}
            placeholder="Nombre o descripción..."
            className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[var(--admin-texto-primario)] transition-colors duration-150 placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)] mb-2">
          Estado
        </label>
        <div className="flex gap-2">
          {[
            { value: "", label: "Todos" },
            { value: "true", label: "Activo" },
            { value: "false", label: "Inactivo" },
          ].map((opt) => {
            const isSelected = filtros.estado === opt.value;
            return (
              <button
                key={opt.value || "todos"}
                onClick={() => onCambiarFiltro("estado", opt.value)}
                style={{
                  backgroundColor: isSelected
                    ? "var(--page-primary)"
                    : "var(--admin-surface-elevated)",
                  color: isSelected
                    ? "var(--page-primary-foreground)"
                    : "var(--admin-texto-muted)",
                  borderColor: isSelected ? "var(--page-primary)" : "var(--admin-border)",
                }}
                className="flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors duration-150"
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)] mb-2">
          Rango de Precio
        </label>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-texto-muted)] text-xs">
              $
            </span>
            <input
              type="number"
              value={filtros.precioMin}
              onChange={(e) => onCambiarFiltro("precioMin", e.target.value)}
              placeholder="Mín"
              min="0"
              className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg pl-7 pr-3 py-2.5 text-sm text-[var(--admin-texto-primario)] transition-colors duration-150 placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]"
            />
          </div>
          <span className="text-[var(--admin-texto-muted)] text-xs font-bold">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-texto-muted)] text-xs">
              $
            </span>
            <input
              type="number"
              value={filtros.precioMax}
              onChange={(e) => onCambiarFiltro("precioMax", e.target.value)}
              placeholder="Máx"
              min="0"
              className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg pl-7 pr-3 py-2.5 text-sm text-[var(--admin-texto-primario)] transition-colors duration-150 placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)] mb-2">
          Duración Máxima
        </label>
        <div className="relative">
          <input
            type="number"
            value={filtros.duracionMax}
            onChange={(e) => onCambiarFiltro("duracionMax", e.target.value)}
            placeholder="ej: 60"
            min="1"
            className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg px-4 pr-14 py-2.5 text-sm text-[var(--admin-texto-primario)] transition-colors duration-150 placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--admin-texto-muted)] uppercase">
            min
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--admin-texto-secundario)] mb-2">
          Ordenar Por
        </label>
        <div className="relative">
          <select
            value={filtros.ordenPor}
            onChange={(e) => onCambiarFiltro("ordenPor", e.target.value)}
            className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--admin-texto-primario)] transition-colors duration-150 appearance-none cursor-pointer focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]"
          >
            <option value="reciente">Más reciente</option>
            <option value="nombre">Nombre A→Z</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="duracion">Duración</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-texto-muted)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}