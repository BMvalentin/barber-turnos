"use client";

import type { BarberoData } from "@/types/turno";

type Props = {
  barberos: BarberoData[];
  barberoIdPropio: string;
  valor: string;
  onChange: (valor: string) => void;
};

export default function SelectorBarberoTurnos({ barberos, barberoIdPropio, valor, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--admin-texto-muted)]">
      <span className="sr-only">Filtrar turnos por empleado</span>
      <select value={valor} onChange={(evento) => onChange(evento.target.value)} aria-label="Filtrar turnos por empleado" className="h-9 max-w-[230px] rounded-lg border bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-texto-primario)]" style={{ borderColor: "var(--admin-border)" }}>
        <option value="">Todos los empleados</option>
        {barberos.map((barbero) => <option key={barbero.id} value={barbero.id}>{barbero.nombre}{barbero.id === barberoIdPropio ? " (yo)" : ""}</option>)}
      </select>
    </label>
  );
}
