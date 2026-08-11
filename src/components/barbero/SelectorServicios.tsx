"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { ServicioOpcion } from "@/types/barbero";

type Props = {
  abierto: boolean;
  onAlternarAbierto: () => void;
  seleccionados: string[];
  opciones: ServicioOpcion[];
  onAlternarSeleccion: (id: string) => void;
};

export default function SelectorServicios({
  abierto,
  onAlternarAbierto,
  seleccionados,
  opciones,
  onAlternarSeleccion,
}: Props) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAlternarAbierto}
        className="w-full flex items-center justify-between p-3 bg-black/60 rounded-lg transition border"
        style={{ borderColor: `var(--page-primary-30)` }}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold" style={{ color: `var(--page-primary-70)` }}>
            Servicios disponibles
          </span>
          <span className="text-xs" style={{ color: "var(--page-primary)" }}>
            {seleccionados.length} seleccionados
          </span>
        </div>

        {abierto ? (
          <ChevronUp className="h-4 w-4" style={{ color: "var(--page-primary)" }} />
        ) : (
          <ChevronDown className="h-4 w-4" style={{ color: "var(--page-primary)" }} />
        )}
      </button>

      {abierto && (
        <div
          className="p-4 bg-black/60 rounded-lg space-y-2 max-h-60 overflow-y-auto border"
          style={{ borderColor: `var(--page-primary-30)` }}
        >
          {seleccionados.length === 0 && (
            <p className="text-xs italic" style={{ color: `var(--page-primary-80)` }}>
              No seleccionaste ningún servicio
            </p>
          )}

          {opciones.length === 0 && (
            <p className="text-xs text-red-400">
              No hay servicios cargados
            </p>
          )}

          {opciones.map((servicio) => (
            <label
              key={servicio.id}
              className="flex items-center gap-2 p-2 rounded cursor-pointer transition hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={seleccionados.includes(servicio.id)}
                onChange={() => onAlternarSeleccion(servicio.id)}
              />
              <span className="text-white text-sm">
                {servicio.nombre}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}