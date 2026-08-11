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
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
          Buscar
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8675]" />
          <input
            type="text"
            value={filtros.search}
            onChange={(e) => onCambiarFiltro("search", e.target.value)}
            placeholder="Nombre o descripción..."
            className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg pl-9 pr-4 py-2.5 text-[#E4E0D9] text-sm outline-none transition-colors placeholder:text-[#8E8675]/50"
            style={{ color: "var(--page-primary)" }}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
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
                    : "#1C1812",
                  color: isSelected
                    ? "var(--page-primary-foreground)"
                    : "#8E8675",
                  borderColor: isSelected ? "var(--page-primary)" : "#2C261D",
                }}
                className="flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors"
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
          Rango de Precio
        </label>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8675] text-xs">
              $
            </span>
            <input
              type="number"
              value={filtros.precioMin}
              onChange={(e) => onCambiarFiltro("precioMin", e.target.value)}
              placeholder="Mín"
              min="0"
              className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg pl-7 pr-3 py-2.5 text-[#E4E0D9] text-sm outline-none transition-colors placeholder:text-[#8E8675]/50"
            />
          </div>
          <span className="text-[#8E8675] text-xs font-bold">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8675] text-xs">
              $
            </span>
            <input
              type="number"
              value={filtros.precioMax}
              onChange={(e) => onCambiarFiltro("precioMax", e.target.value)}
              placeholder="Máx"
              min="0"
              className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg pl-7 pr-3 py-2.5 text-[#E4E0D9] text-sm outline-none transition-colors placeholder:text-[#8E8675]/50"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
          Duración Máxima
        </label>
        <div className="relative">
          <input
            type="number"
            value={filtros.duracionMax}
            onChange={(e) => onCambiarFiltro("duracionMax", e.target.value)}
            placeholder="ej: 60"
            min="1"
            className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg px-4 pr-14 py-2.5 text-[#E4E0D9] text-sm outline-none transition-colors placeholder:text-[#8E8675]/50"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8E8675] uppercase">
            min
          </span>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
          Ordenar Por
        </label>
        <div className="relative">
          <select
            value={filtros.ordenPor}
            onChange={(e) => onCambiarFiltro("ordenPor", e.target.value)}
            className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg px-4 py-2.5 text-[#E4E0D9] text-sm outline-none transition-colors appearance-none cursor-pointer"
          >
            <option value="reciente">Más reciente</option>
            <option value="nombre">Nombre A→Z</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="duracion">Duración</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8675] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}