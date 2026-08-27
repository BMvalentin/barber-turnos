"use client";

import { Check } from "lucide-react";
import type { ServicioData } from "@/types/turno";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

type Props = {
  selectedServicioId: string;
  servicios: ServicioData[];
  serviciosFiltrados: ServicioData[];
  handleServicioChange: (id: string) => void;
};

export default function SeccionServicio({
  selectedServicioId,
  servicios,
  serviciosFiltrados,
  handleServicioChange,
}: Props) {
  const servicioSeleccionado = servicios.find(
    (s) => s.id === selectedServicioId
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">
        Servicio <span style={{ color: "var(--primary)" }}>*</span>
      </label>

      <input type="hidden" name="servicioId" value={selectedServicioId} />

      {serviciosFiltrados.length === 0 ? (
        <p className="text-xs text-[var(--page-primary-80)]">
          Ningún servicio disponible
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviciosFiltrados.map((servicio) => {
            const seleccionado = servicio.id === selectedServicioId;
            return (
              <button
                key={servicio.id}
                type="button"
                aria-pressed={seleccionado}
                onClick={() => handleServicioChange(servicio.id)}
                className="relative rounded-2xl border p-4 flex flex-col items-start gap-1 text-left transition-all duration-200 focus:outline-none bg-transparent hover:bg-[var(--page-primary-60)] min-w-0"
                style={{
                  borderColor: seleccionado
                    ? "var(--page-primary)"
                    : "var(--page-primary-20)",
                  backgroundColor: seleccionado
                    ? "var(--page-primary-15)"
                    : undefined,
                  transform: seleccionado ? "scale(1.03)" : undefined,
                  outlineColor: "var(--page-primary)",
                }}
              >
                <span
                  className="text-sm font-semibold min-w-0 break-words [overflow-wrap:anywhere]"
                  style={{ color: "var(--page-primary-tinta)" }}
                >
                  {servicio.nombre}
                </span>
                <span className="text-xs text-zinc-400 break-words [overflow-wrap:anywhere]">
                  {servicio.duracion} min - $
                  {formatearMoneda(servicio.precio)}
                </span>
                {seleccionado && (
                  <span
                    className="absolute top-2 right-2 rounded-full p-1"
                    style={{ backgroundColor: "var(--page-primary)" }}
                  >
                    <Check
                      className="h-3 w-3"
                      style={{ color: "var(--page-primary-foreground)" }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {servicioSeleccionado?.descripcion && (
        <p
          className="text-xs text-zinc-400 italic p-3 rounded-lg bg-zinc-800/40 border-l-2 min-w-0 break-words [overflow-wrap:anywhere] line-clamp-3"
          style={{ borderColor: "var(--primary)" }}
          title={servicioSeleccionado.descripcion}
        >
          {servicioSeleccionado.descripcion}
        </p>
      )}
    </div>
  );
}
