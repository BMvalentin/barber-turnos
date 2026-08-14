"use client";
// src/components/test-mp/ListaTurnos.tsx

import type { Turno } from "./tipos";
import { ESTADO_COLOR } from "./constantes";
import { cortarId } from "./cortarId";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import EmptyState from "@/components/ui/EmptyState";

export function ListaTurnos({
  turnos,
  selectedId,
  onSelect,
}: {
  turnos: Turno[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="w-64 border-r border-zinc-800 flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
          Turnos ({turnos.length})
        </p>
      </div>
      <div className="overflow-y-auto flex-1">
        {turnos.length === 0 && (
          <EmptyState
            mensaje="No hay turnos en la base de datos."
            claseContenedor="px-4 py-6 text-center"
            claseMensaje="text-zinc-600 text-xs"
          />
        )}
        {turnos.map((turno) => (
          <button
            key={turno.id}
            onClick={() => onSelect(turno.id)}
            className={`w-full text-left px-4 py-3 border-b border-zinc-800/60 transition-colors hover:bg-zinc-800/40 ${
              selectedId === turno.id
                ? "bg-zinc-800 border-l-2 border-l-amber-400"
                : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-400">{cortarId(turno.id)}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                  ESTADO_COLOR[turno.estado] ?? "text-zinc-400"
                }`}
              >
                {turno.estado}
              </span>
            </div>
            <p className="text-xs text-zinc-300 truncate">{turno.servicioNombre}</p>
            <p className="text-xs text-zinc-600 truncate">{turno.userName}</p>
            <p className="text-xs text-amber-500/70 mt-1">
              ${formatearMoneda(turno.seniaCongelada)} seña
            </p>
          </button>
        ))}
      </div>
    </aside>
  );
}