"use client";

import type { BarberoData } from "@/types/turno";

type Props = {
  selectedBarberoId: string;
  selectedServicioId: string;
  barberosFiltrados: BarberoData[];
  handleBarberoChange: (id: string) => void;
};

export default function SeccionBarbero({
  selectedBarberoId,
  selectedServicioId,
  barberosFiltrados,
  handleBarberoChange,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">
        Barbero <span style={{ color: "var(--primary)" }}>*</span>
      </label>
      <select
        name="barberoId"
        required
        value={selectedBarberoId}
        onChange={(e) => handleBarberoChange(e.target.value)}
        className="w-full p-3 border border-zinc-700 rounded-xl bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2"
        style={{ outlineColor: "var(--primary)" }}
      >
        <option value="">-- Seleccionar Barbero --</option>
        {barberosFiltrados.map((b) => (
          <option key={b.id} value={b.id}>
            {b.nombre}
          </option>
        ))}
      </select>
      {barberosFiltrados.length === 0 && (
        <p className="text-xs text-[var(--page-primary-80)]">
          {selectedServicioId
            ? "Ningún barbero ofrece este servicio."
            : "No hay barberos disponibles."}
        </p>
      )}
    </div>
  );
}