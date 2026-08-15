"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { deleteservicio } from "@/actions/servicios/eliminar.actions";
import { ESTILO_FONDO_MARCA } from "@/lib/constants";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { useFiltrosServicios } from "@/hooks/useFiltrosServicios";
import { Button } from "@/components/ui/button/Button";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import ServicioStats from "./ServicioStats";
import PanelFiltros from "./PanelFiltros";
import FilterTag from "./FilterTag";
import ServicioTabla from "./ServicioTabla";
import CreateServicioForm from "./CreateServicioForm";
import type { Servicio } from "@/types/servicio";
import type { Barbero } from "@/types/barbero";

export default function ServicioList({
  servicios,
  barberos,
}: {
  servicios: Servicio[];
  barberos: Barbero[];
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState<string | null>(null);

  const { filters, updateFilter, resetFilters, activeFilterCount, serviciosFiltrados, totalPages, startIndex, paginatedServicios, displayCount, currentPage, setCurrentPage, activeServicesCount, avgPrice, avgTime } = useFiltrosServicios(servicios);

  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Servicio eliminado",
    descripcionExito: "El servicio ha sido eliminado correctamente.",
    mensajeError: "Error al eliminar",
    descripcionError: "Ocurrió un error al intentar eliminar el servicio.",
    recargarPagina: true,
  });

  const handleEliminar = (id: string) => {
    setItemAEliminar(id);
    setMostrarConfirmacion(true);
  };

  const cancelarEliminacion = () => {
    setMostrarConfirmacion(false);
    setItemAEliminar(null);
  };

  const confirmarEliminacion = async () => {
    if (!itemAEliminar) return;
    const idAEliminar = itemAEliminar;
    setMostrarConfirmacion(false);
    setItemAEliminar(null);

    const formData = new FormData();
    formData.append("id", idAEliminar);

    try {
      const result = await deleteservicio(formData);
      if (!result.success) {
        await retroalimentar(result);
        return;
      }
      await retroalimentar(result);
    } catch (error) {
      console.error(error);
      await retroalimentar({
        success: false,
        error: "Ocurrió un error inesperado.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <ServicioStats
        serviciosActivos={activeServicesCount}
        precioPromedio={avgPrice}
        tiempoPromedio={avgTime}
      />

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: "var(--page-primary-tinta)" }}
            >
              Catálogo
            </p>
            <h2 className="text-2xl font-bold text-[var(--admin-texto-primario)]">
              Menú de Barbería
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-3 sm:mt-0">
            <PanelFiltros
              filtros={filters}
              onCambiarFiltro={updateFilter}
              onLimpiarFiltros={resetFilters}
              filtrosActivos={activeFilterCount}
              totalResultados={serviciosFiltrados.length}
              totalServicios={servicios.length}
            />

            <Button
              className="flex items-center gap-2 px-4 py-2 text-[var(--page-primary-foreground)] hover:opacity-90"
              style={ESTILO_FONDO_MARCA}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" /> Nuevo Servicio
            </Button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.search && (
              <FilterTag label={`"${filters.search}"`} onRemove={() => updateFilter("search", "")} />
            )}
            {filters.estado !== "" && (
              <FilterTag label={filters.estado === "true" ? "Activos" : "Inactivos"} onRemove={() => updateFilter("estado", "")} />
            )}
            {filters.precioMin && (
              <FilterTag label={`Precio ≥ $${filters.precioMin}`} onRemove={() => updateFilter("precioMin", "")} />
            )}
            {filters.precioMax && (
              <FilterTag label={`Precio ≤ $${filters.precioMax}`} onRemove={() => updateFilter("precioMax", "")} />
            )}
            {filters.duracionMax && (
              <FilterTag label={`≤ ${filters.duracionMax} min`} onRemove={() => updateFilter("duracionMax", "")} />
            )}
            <button
              onClick={resetFilters}
              className="text-[10px] font-bold text-[var(--admin-texto-muted)] hover:text-red-400 uppercase tracking-wider transition-colors duration-150 px-1"
            >
              Limpiar todo
            </button>
          </div>
        )}

        <ServicioTabla
          servicios={paginatedServicios}
          barberos={barberos}
          onEliminar={handleEliminar}
          estaVacio={serviciosFiltrados.length === 0}
          sinServicios={servicios.length === 0}
          hayFiltros={activeFilterCount > 0}
          onLimpiarFiltros={resetFilters}
          paginaActual={currentPage}
          totalPaginas={totalPages}
          desde={startIndex + 1}
          hasta={startIndex + displayCount}
          totalResultados={serviciosFiltrados.length}
          onCambiarPagina={setCurrentPage}
        />
      </div>

      {mostrarConfirmacion && (
        <ConfirmDialog
          title="Eliminar servicio"
          message={`¿Estás seguro de que deseas eliminar el servicio "${servicios.find((s) => s.id === itemAEliminar)?.nombre}"?`}
          onConfirm={confirmarEliminacion}
          onCancel={cancelarEliminacion}
        />
      )}

      {showCreateModal && (
        <CreateServicioForm
          barberos={barberos}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}