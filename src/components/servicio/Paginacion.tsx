"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginacionProps = {
  paginaActual: number;
  totalPaginas: number;
  desde: number;
  hasta: number;
  totalResultados: number;
  onCambiarPagina: (pagina: number) => void;
};

export default function Paginacion({ paginaActual, totalPaginas, desde, hasta, totalResultados, onCambiarPagina }: PaginacionProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm text-[var(--admin-texto-muted)] lg:border-t lg:border-[var(--admin-border)] lg:px-4">
      <p className="tabular-nums">{desde}–{hasta} de {totalResultados} {totalResultados === 1 ? "servicio" : "servicios"}</p>
      {totalPaginas > 1 && (
        <nav className="flex items-center gap-2" aria-label="Páginas de servicios">
          <button
            type="button"
            aria-label="Página anterior"
            onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
            className="admin-control"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <span className="tabular-nums">{paginaActual} / {totalPaginas}</span>
          <button
            type="button"
            aria-label="Página siguiente"
            onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
            className="admin-control"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
