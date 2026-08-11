"use client";

import { useMemo, useState } from "react";
import type { Servicio } from "@/types/servicio";

export type FilterState = {
  search: string;
  estado: string;
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

const ITEMS_PER_PAGE = 8;

export function useFiltrosServicios(servicios: Servicio[]) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const serviciosFiltrados = useMemo(() => {
    const filtrados = servicios.filter((s) => {
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
    });

    return filtrados.sort((a, b) => {
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
  }, [servicios, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(serviciosFiltrados.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedServicios = serviciosFiltrados.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const displayCount = paginatedServicios.length;

  const activeFilterCount = [
    filters.search.trim(),
    filters.estado,
    filters.precioMin,
    filters.precioMax,
    filters.duracionMax,
  ].filter(Boolean).length;

  function resetFilters() {
    setFilters(defaultFilters);
    setCurrentPage(1);
  }

  function updateFilter<K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
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

  return {
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    serviciosFiltrados,
    totalPages,
    startIndex,
    paginatedServicios,
    displayCount,
    currentPage,
    setCurrentPage,
    activeServicesCount,
    avgPrice,
    avgTime,
  };
}