"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { deleteservicio } from "@/actions/servicios/eliminar.actions";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { useFiltrosServicios } from "@/hooks/useFiltrosServicios";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import ServicioStats from "./ServicioStats";
import PanelFiltros from "./PanelFiltros";
import FilterTag from "./FilterTag";
import ServicioTabla from "./ServicioTabla";
import CreateServicioForm from "./CreateServicioForm";
import type { Servicio } from "@/types/servicio";

export default function ServicioList({
  servicios,
  puedeGestionar = true,
}: {
  servicios: Servicio[];
  puedeGestionar?: boolean;
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
    <>
      <ServicioStats
        serviciosActivos={activeServicesCount}
        precioPromedio={avgPrice}
        tiempoPromedio={avgTime}
      />

      <section aria-labelledby="catalogo-servicios" className="min-w-0 space-y-3">
        <div className="admin-card space-y-4 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="catalogo-servicios" className="text-lg font-semibold tracking-tight">Catálogo</h2>
              <p className="mt-0.5 text-sm text-[var(--admin-texto-muted)]">
                {serviciosFiltrados.length} {serviciosFiltrados.length === 1 ? "servicio" : "servicios"}
              </p>
            </div>
            {puedeGestionar && (
              <button type="button" className="admin-accion" onClick={() => setShowCreateModal(true)}>
                <Plus aria-hidden="true" className="size-4" /> Nuevo servicio
              </button>
            )}
          </div>
          <PanelFiltros
            filtros={filters}
            onCambiarFiltro={updateFilter}
            filtrosActivos={activeFilterCount}
          />
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
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
                type="button"
                className="min-h-9 rounded-lg px-2 text-sm font-medium text-[var(--admin-acento-suave-texto)] hover:bg-[var(--admin-item)]"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        <ServicioTabla
          servicios={paginatedServicios}
          puedeGestionar={puedeGestionar}
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
      </section>

      {mostrarConfirmacion && (
        <ConfirmDialog
          title="Eliminar servicio"
          message={`¿Estás seguro de que deseas eliminar el servicio "${servicios.find((s) => s.id === itemAEliminar)?.nombre}"?`}
          onConfirm={confirmarEliminacion}
          onCancel={cancelarEliminacion}
        />
      )}

      {puedeGestionar && showCreateModal && (
        <CreateServicioForm
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
