"use client";

import { useEffect, useRef, useState } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { ESTILO_FONDO_MARCA } from "@/lib/constants";
import CamposFiltros from "./CamposFiltros";
import type { FilterState } from "@/hooks/useFiltrosServicios";

type PanelFiltrosProps = {
  filtros: FilterState;
  onCambiarFiltro: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  onLimpiarFiltros: () => void;
  filtrosActivos: number;
  totalResultados: number;
  totalServicios: number;
};

export default function PanelFiltros({
  filtros,
  onCambiarFiltro,
  onLimpiarFiltros,
  filtrosActivos,
  totalResultados,
  totalServicios,
}: PanelFiltrosProps) {
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setMostrarPanel(false);
      }
    }
    if (mostrarPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mostrarPanel]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setMostrarPanel((v) => !v)}
        style={{
          borderColor:
            mostrarPanel || filtrosActivos > 0
              ? "var(--page-primary)"
              : "var(--admin-border)",
          color:
            mostrarPanel || filtrosActivos > 0
              ? "var(--page-primary)"
              : "var(--admin-texto-primario)",
          backgroundColor:
            mostrarPanel || filtrosActivos > 0
              ? "var(--page-primary-15)"
              : "var(--admin-surface-elevated)",
        }}
        className="flex items-center gap-2 px-4 py-2 border text-[10px] font-bold uppercase tracking-wider rounded transition-colors duration-150 hover:bg-white/5"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtrar
        {filtrosActivos > 0 && (
          <span
            className="text-[var(--page-primary-foreground)] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none"
            style={ESTILO_FONDO_MARCA}
          >
            {filtrosActivos}
          </span>
        )}
      </button>

      {mostrarPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 sm:hidden"
            onClick={() => setMostrarPanel(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 h-[85dvh] bg-[var(--admin-surface-elevated)] border-t border-[var(--admin-border)] rounded-t-3xl shadow-2xl flex flex-col sm:absolute sm:right-0 sm:top-full sm:bottom-auto sm:inset-x-auto sm:mt-2 sm:w-80 sm:h-auto sm:rounded-xl sm:border sm:border-[var(--admin-border)] sm:overflow-hidden">
            <div className="shrink-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--admin-border)]">
                <div className="flex items-center gap-2">
                  <Filter
                    className="w-4 h-4"
                    style={{ color: "var(--page-primary-tinta)" }}
                  />
                  <span className="text-xs font-bold text-[var(--admin-texto-primario)] uppercase tracking-wider">
                    Filtros
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {filtrosActivos > 0 && (
                    <button
                      onClick={onLimpiarFiltros}
                      className="text-[10px] font-bold text-[var(--admin-texto-muted)] uppercase tracking-wider transition-colors duration-150"
                      style={{ color: "var(--page-primary-tinta)" }}
                    >
                      Limpiar
                    </button>
                  )}
                  <button
                    onClick={() => setMostrarPanel(false)}
                    className="text-[var(--admin-texto-muted)] hover:text-[var(--admin-texto-primario)] transition-colors duration-150"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <CamposFiltros filtros={filtros} onCambiarFiltro={onCambiarFiltro} />

            <div className="shrink-0 px-5 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface)]">
              <p className="text-[10px] text-[var(--admin-texto-muted)] text-center">
                {totalResultados} de {totalServicios} servicios encontrados
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}