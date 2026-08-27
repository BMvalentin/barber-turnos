"use client";

import type { BarberoData } from "@/types/turno";
import SelectorBarberoTarjetas from "./SelectorBarberoTarjetas";

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
    <div className="space-y-3 md:col-span-2">
      <label className="text-sm font-medium text-zinc-300">
        Barbero <span style={{ color: "var(--primary)" }}>*</span>
      </label>
      <SelectorBarberoTarjetas
        name="barberoId"
        barberos={barberosFiltrados}
        seleccionadoId={selectedBarberoId}
        onChange={handleBarberoChange}
      />
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
