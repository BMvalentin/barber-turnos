"use client";

type PaginacionProps = {
  paginaActual: number;
  totalPaginas: number;
  desde: number;
  hasta: number;
  totalResultados: number;
  onCambiarPagina: (pagina: number) => void;
};

export default function Paginacion({
  paginaActual,
  totalPaginas,
  desde,
  hasta,
  totalResultados,
  onCambiarPagina,
}: PaginacionProps) {
  return (
    <div className="p-4 border-t border-[var(--admin-border)] flex justify-between items-center text-sm text-[var(--admin-texto-muted)]">
      <p>
        Mostrando {desde} - {hasta} de {totalResultados} resultados
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
          disabled={paginaActual === 1}
          className="px-3 py-1 border border-[var(--admin-border)] rounded hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150"
        >
          &lt;
        </button>
        <div className="flex items-center gap-1">
          <span
            className="font-bold px-2"
            style={{ color: "var(--page-primary-tinta)" }}
          >
            {paginaActual}
          </span>
          <span className="text-[var(--admin-texto-muted)]">/</span>
          <span className="text-[var(--admin-texto-muted)] px-2">{totalPaginas}</span>
        </div>
        <button
          onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 border border-[var(--admin-border)] rounded hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}