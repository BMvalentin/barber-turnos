"use client";

import type { ServicioData } from "@/types/turno";

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
  return (
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-medium text-zinc-300">
        Servicio <span style={{ color: "var(--primary)" }}>*</span>
      </label>
      <select
        name="servicioId"
        required
        value={selectedServicioId}
        onChange={(e) => handleServicioChange(e.target.value)}
        className="w-full p-3 border border-zinc-700 rounded-xl bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2"
        style={{ outlineColor: "var(--primary)" }}
      >
        <option value="">-- Seleccionar Servicio --</option>

        {serviciosFiltrados.map((s) => {
          const descripcionCorta =
            s.descripcion && s.descripcion.length > 50
              ? s.descripcion.substring(0, 50) + "..."
              : s.descripcion;

          return (
            <option key={s.id} value={s.id}>
              {s.nombre}
              {s.precio && ` - $${s.precio.toString()}`}
              {s.duracion && ` (${s.duracion} min)`}
              {descripcionCorta && ` - ${descripcionCorta}`}
            </option>
          );
        })}
      </select>

      {selectedServicioId &&
        servicios.find((s) => s.id === selectedServicioId)?.descripcion && (
          <p
            className="text-xs text-zinc-400 italic p-3 rounded-lg bg-zinc-800/40 border-l-2"
            style={{ borderColor: "var(--primary)" }}
          >
            {servicios.find((s) => s.id === selectedServicioId)?.descripcion}
          </p>
        )}
    </div>
  );
}