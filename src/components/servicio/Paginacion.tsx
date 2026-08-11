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
    <div className="p-4 border-t border-[#2C261D] flex justify-between items-center text-sm text-[#8E8675]">
      <p>
        Mostrando {desde} - {hasta} de {totalResultados} resultados
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
          disabled={paginaActual === 1}
          className="px-3 py-1 border border-[#2C261D] rounded hover:bg-[#2C261D] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          &lt;
        </button>
        <div className="flex items-center gap-1">
          <span
            className="font-bold px-2"
            style={{ color: "var(--page-primary)" }}
          >
            {paginaActual}
          </span>
          <span className="text-[#8E8675]">/</span>
          <span className="text-[#8E8675] px-2">{totalPaginas}</span>
        </div>
        <button
          onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 border border-[#2C261D] rounded hover:bg-[#2C261D] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}