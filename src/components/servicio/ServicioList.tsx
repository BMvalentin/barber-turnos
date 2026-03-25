"use client";

import { deleteservicio } from "@/actions/servicio-actions";
import { useActionState, useState, useRef, useEffect } from "react";
import EditServicioModal from "./EditServicioModal";
import CreateServicioForm from "./CreateServicioForm";
import Link from "next/link";
import {
  Scissors,
  Clock,
  Plus,
  Filter,
  Trash2,
  SquarePen,
  ArrowLeft,
  X,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  srcImage: string | null;
  estado: boolean;
  duracion: number;
  precio: number;
  descuento: number;
  senia: number;
  createdAt: Date;
  barberos?: {
    barbero: {
      id: string;
      nombre: string;
    };
  }[];
};

type Barbero = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
};

type FilterState = {
  search: string;
  estado: string; // "" = todos, "true" = activo, "false" = inactivo
  precioMin: string;
  precioMax: string;
  duracionMax: string;
  ordenPor: string;
};

const defaultFilters: FilterState = {
  search: "",
  estado: "",
  precioMin: "",
  precioMax: "",
  duracionMax: "",
  ordenPor: "reciente",
};

export default function ServicioList({
  servicios,
  barberos,
}: {
  servicios: Servicio[];
  barberos: Barbero[];
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target as Node)
      ) {
        setShowFilterPanel(false);
      }
    }
    if (showFilterPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterPanel]);

  const serviciosFiltrados = servicios
    .filter((s) => {
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchNombre = s.nombre.toLowerCase().includes(q);
        const matchDesc = s.descripcion?.toLowerCase().includes(q) ?? false;
        if (!matchNombre && !matchDesc) return false;
      }

      if (filters.estado !== "") {
        const activo = filters.estado === "true";
        if (s.estado !== activo) return false;
      }

      if (filters.precioMin !== "" && s.precio < parseFloat(filters.precioMin))
        return false;

      if (filters.precioMax !== "" && s.precio > parseFloat(filters.precioMax))
        return false;

      if (
        filters.duracionMax !== "" &&
        s.duracion > parseInt(filters.duracionMax)
      )
        return false;

      return true;
    })
    .sort((a, b) => {
      switch (filters.ordenPor) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre);
        case "precio_asc":
          return a.precio - b.precio;
        case "precio_desc":
          return b.precio - a.precio;
        case "duracion":
          return a.duracion - b.duracion;
        case "reciente":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const activeFilterCount = [
    filters.search.trim(),
    filters.estado,
    filters.precioMin,
    filters.precioMax,
    filters.duracionMax,
  ].filter(Boolean).length;

  function resetFilters() {
    setFilters(defaultFilters);
  }

  function updateFilter<K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const activeServicesCount = servicios.filter((s) => s.estado).length;
  const avgPrice =
    servicios.length > 0
      ? (
          servicios.reduce((acc, s) => acc + s.precio, 0) / servicios.length
        ).toFixed(2)
      : "0.00";
  const avgTime =
    servicios.length > 0
      ? Math.round(
          servicios.reduce((acc, s) => acc + s.duracion, 0) / servicios.length,
        )
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[10px] font-bold text-[#8E8675] uppercase tracking-wider hover:text-[#E4E0D9] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-5">
          <p className="text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
            Servicios Activos
          </p>
          <p className="text-3xl font-semibold text-[#E8B031]">
            {activeServicesCount}
          </p>
        </div>
        <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-5">
          <p className="text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
            Precio Promedio
          </p>
          <p className="text-3xl font-semibold text-[#E4E0D9]">${avgPrice}</p>
        </div>
        <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-5">
          <p className="text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
            Tiempo Estimado
          </p>
          <p className="text-3xl font-semibold text-[#E4E0D9]">{avgTime} min</p>
        </div>
        <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-5">
          <p className="text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
            Ingreso Proyectado
          </p>
          <p className="text-3xl font-semibold text-[#E4E0D9]">$1.2k</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[10px] font-bold text-[#E8B031] uppercase tracking-wider mb-1">
              Catálogo
            </p>
            <h2 className="text-2xl font-bold text-[#E4E0D9]">
              Menú de Barbería
            </h2>
          </div>

          <div className="flex gap-3">
            <div className="relative" ref={filterPanelRef}>
              <button
                onClick={() => setShowFilterPanel((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 border text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                  showFilterPanel || activeFilterCount > 0
                    ? "border-[#E8B031] text-[#E8B031] bg-[#E8B031]/10"
                    : "border-[#2C261D] text-[#E4E0D9] bg-[#1C1812] hover:bg-[#2C261D]"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtrar
                {activeFilterCount > 0 && (
                  <span className="bg-[#E8B031] text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {showFilterPanel && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#14110C] border border-[#2C261D] rounded-xl shadow-2xl z-40 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C261D]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#E8B031]" />
                      <span className="text-xs font-bold text-[#E4E0D9] uppercase tracking-wider">
                        Filtros
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={resetFilters}
                          className="text-[10px] font-bold text-[#8E8675] hover:text-[#E8B031] uppercase tracking-wider transition-colors"
                        >
                          Limpiar
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilterPanel(false)}
                        className="text-[#8E8675] hover:text-[#E4E0D9] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Búsqueda */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                        Buscar
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8675]" />
                        <input
                          type="text"
                          value={filters.search}
                          onChange={(e) =>
                            updateFilter("search", e.target.value)
                          }
                          placeholder="Nombre o descripción..."
                          className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg pl-9 pr-4 py-2.5 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors placeholder:text-[#8E8675]/50"
                        />
                      </div>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                        Estado
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: "", label: "Todos" },
                          { value: "true", label: "Activo" },
                          { value: "false", label: "Inactivo" },
                        ].map((opt) => (
                          <button
                            key={opt.value || "todos"}
                            onClick={() => updateFilter("estado", opt.value)}
                            className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              filters.estado === opt.value
                                ? "bg-[#E8B031] text-black"
                                : "bg-[#1C1812] border border-[#2C261D] text-[#8E8675] hover:border-[#E8B031] hover:text-[#E4E0D9]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rango de precio */}
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
                            value={filters.precioMin}
                            onChange={(e) =>
                              updateFilter("precioMin", e.target.value)
                            }
                            placeholder="Mín"
                            min="0"
                            className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg pl-7 pr-3 py-2.5 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors placeholder:text-[#8E8675]/50"
                          />
                        </div>
                        <span className="text-[#8E8675] text-xs font-bold">
                          —
                        </span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8675] text-xs">
                            $
                          </span>
                          <input
                            type="number"
                            value={filters.precioMax}
                            onChange={(e) =>
                              updateFilter("precioMax", e.target.value)
                            }
                            placeholder="Máx"
                            min="0"
                            className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg pl-7 pr-3 py-2.5 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors placeholder:text-[#8E8675]/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Duración máxima */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                        Duración Máxima
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={filters.duracionMax}
                          onChange={(e) =>
                            updateFilter("duracionMax", e.target.value)
                          }
                          placeholder="ej: 60"
                          min="1"
                          className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg px-4 pr-14 py-2.5 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors placeholder:text-[#8E8675]/50"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8E8675] uppercase">
                          min
                        </span>
                      </div>
                    </div>

                    {/* Ordenar por */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider mb-2">
                        Ordenar Por
                      </label>
                      <div className="relative">
                        <select
                          value={filters.ordenPor}
                          onChange={(e) =>
                            updateFilter("ordenPor", e.target.value)
                          }
                          className="w-full bg-[#1C1812] border border-[#2C261D] rounded-lg px-4 py-2.5 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="reciente">Más reciente</option>
                          <option value="nombre">Nombre A→Z</option>
                          <option value="precio_asc">
                            Precio: menor a mayor
                          </option>
                          <option value="precio_desc">
                            Precio: mayor a menor
                          </option>
                          <option value="duracion">Duración</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8675] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-t border-[#2C261D] bg-[#1C1812]/50">
                    <p className="text-[10px] text-[#8E8675] text-center">
                      {serviciosFiltrados.length} de {servicios.length}{" "}
                      servicios encontrados
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E8B031] text-black text-[10px] font-bold uppercase tracking-wider rounded hover:bg-[#d49f2c] transition-colors"
            >
              <Plus className="w-4 h-4" /> Nuevo Servicio
            </button>
          </div>
        </div>

        {/* Tags de filtros activos */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.search && (
              <FilterTag
                label={`"${filters.search}"`}
                onRemove={() => updateFilter("search", "")}
              />
            )}
            {filters.estado !== "" && (
              <FilterTag
                label={filters.estado === "true" ? "Activos" : "Inactivos"}
                onRemove={() => updateFilter("estado", "")}
              />
            )}
            {filters.precioMin && (
              <FilterTag
                label={`Precio ≥ $${filters.precioMin}`}
                onRemove={() => updateFilter("precioMin", "")}
              />
            )}
            {filters.precioMax && (
              <FilterTag
                label={`Precio ≤ $${filters.precioMax}`}
                onRemove={() => updateFilter("precioMax", "")}
              />
            )}
            {filters.duracionMax && (
              <FilterTag
                label={`≤ ${filters.duracionMax} min`}
                onRemove={() => updateFilter("duracionMax", "")}
              />
            )}
            <button
              onClick={resetFilters}
              className="text-[10px] font-bold text-[#8E8675] hover:text-red-400 uppercase tracking-wider transition-colors px-1"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {serviciosFiltrados.length === 0 ? (
          <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl p-12 text-center">
            <Scissors className="h-12 w-12 text-[#8E8675] mx-auto mb-4 opacity-50" />
            <p className="text-[#8E8675]">
              {servicios.length === 0
                ? "No hay servicios disponibles. Comienza agregando uno."
                : "No hay servicios que coincidan con los filtros aplicados."}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 text-[10px] font-bold text-[#E8B031] uppercase tracking-wider hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#1C1812] border border-[#2C261D] rounded-xl overflow-hidden">
            {/* Table Header — sin columna Categoría, Servicio ocupa col-span-7 */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#2C261D] bg-[#14110C]/50 text-[11px] font-bold text-[#8E8675] uppercase tracking-wider">
              <div className="col-span-7">Servicio</div>
              <div className="col-span-2 text-center">Duración</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-1 text-right">Acciones</div>
            </div>

            <div className="divide-y divide-[#2C261D]">
              {serviciosFiltrados.map((servicio) => (
                <ServicioRow
                  key={servicio.id}
                  servicio={servicio}
                  barberos={barberos}
                />
              ))}
            </div>

            <div className="p-4 border-t border-[#2C261D] flex justify-between items-center text-sm text-[#8E8675]">
              <p>
                Mostrando {serviciosFiltrados.length} de {servicios.length}{" "}
                servicios
              </p>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-[#2C261D] rounded hover:bg-[#2C261D]">
                  &lt;
                </button>
                <button className="px-3 py-1 bg-[#E8B031] text-black font-semibold rounded">
                  1
                </button>
                <button className="px-3 py-1 border border-[#2C261D] rounded hover:bg-[#2C261D]">
                  2
                </button>
                <button className="px-3 py-1 border border-[#2C261D] rounded hover:bg-[#2C261D]">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateServicioForm
          barberos={barberos}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E8B031]/10 border border-[#E8B031]/30 text-[#E8B031] text-[10px] font-bold uppercase tracking-wider rounded">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition-colors leading-none"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function ServicioRow({
  servicio,
  barberos,
}: {
  servicio: Servicio;
  barberos: Barbero[];
}) {
  const [state, formAction] = useActionState(deleteservicio, initialState);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#14110C]/80 transition-colors group">
        {/* Servicio: col-span-7 para coincidir con el header */}
        <div className="col-span-7 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#251f15] border border-[#2C261D] flex items-center justify-center flex-shrink-0 text-[#E8B031]">
            {servicio.srcImage ? (
              <img
                src={servicio.srcImage}
                alt={servicio.nombre}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Scissors className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-[#E4E0D9] font-semibold text-sm">
              {servicio.nombre}
            </h3>
            {servicio.descripcion && (
              <p className="text-[#8E8675] text-xs truncate max-w-[280px]">
                {servicio.descripcion}
              </p>
            )}
          </div>
        </div>

        <div className="col-span-2 flex justify-center items-center gap-1 text-[#8E8675] text-sm">
          <Clock className="w-3 h-3" />
          {servicio.duracion} min
        </div>

        <div className="col-span-2 flex justify-center font-semibold text-[#E8B031] text-sm">
          ${servicio.precio}
        </div>

        <div className="col-span-1 flex justify-end gap-2 items-center">
          <button
            onClick={() => setShowEditModal(true)}
            title="Editar servicio"
            className="text-[#8E8675] hover:text-[#E8B031] transition-colors p-1"
          >
            <SquarePen className="w-5 h-5" />
          </button>

          <form action={formAction}>
            <input type="hidden" name="id" value={servicio.id} />
            <button
              type="submit"
              title="Eliminar servicio"
              className="text-[#8E8675] hover:text-red-500 transition-colors p-1"
              onClick={(e) => {
                if (
                  !confirm(
                    `¿Estás seguro de que deseas eliminar el servicio "${servicio.nombre}"?`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {showEditModal && (
        <EditServicioModal
          servicio={servicio}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
