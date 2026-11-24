"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, UsersRound } from "lucide-react";
import { DetailCard } from "@/components/panel/DetailCard";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

const EMPLEADOS_POR_PAGINA = 4;

type VentaEmpleado = {
  id: string;
  nombre: string;
  cobrado: number;
  completados: number;
};

export function DetalleVentasEquipo({ empleados }: { empleados: VentaEmpleado[] }) {
  const [paginaSolicitada, setPagina] = useState(1);
  const totalPaginas = Math.ceil(empleados.length / EMPLEADOS_POR_PAGINA);
  const pagina = Math.min(paginaSolicitada, totalPaginas);
  const inicio = (pagina - 1) * EMPLEADOS_POR_PAGINA;
  const visibles = empleados.slice(inicio, inicio + EMPLEADOS_POR_PAGINA);

  return (
    <DetailCard title="Ventas por empleado" icon={UsersRound}>
      {empleados.length === 0 ? (
        <p className="py-4 text-sm text-[var(--admin-texto-muted)]">No hay cobros ni turnos completados en este período.</p>
      ) : (
        <>
          <ul className="divide-y divide-[var(--admin-border)]">
            {visibles.map((empleado) => (
              <li key={empleado.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] items-center gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium [overflow-wrap:anywhere]">{empleado.nombre}</p>
                  <p className="text-sm text-[var(--admin-texto-muted)]">
                    {empleado.completados} {empleado.completados === 1 ? "turno completado" : "turnos completados"}
                  </p>
                </div>
                <p className="text-right text-sm font-semibold tabular-nums [overflow-wrap:anywhere]">
                  <span className="sr-only">Cobrado </span>$ {formatearMoneda(empleado.cobrado / 100)}
                </p>
              </li>
            ))}
          </ul>
          {totalPaginas > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] py-2.5">
              <p role="status" className="text-sm tabular-nums text-[var(--admin-texto-muted)]">
                {inicio + 1}–{inicio + visibles.length} de {empleados.length}
                <span className="sr-only"> empleados con actividad</span>
              </p>
              <div className="flex gap-2">
                <button type="button" aria-label="Página anterior de empleados" className="admin-control size-11 px-0" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
                  <ChevronLeft size={17} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Página siguiente de empleados" className="admin-control size-11 px-0" disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)}>
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
