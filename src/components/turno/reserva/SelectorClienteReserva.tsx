"use client";

import type { PropsSelectorClienteReserva } from "@/components/turno/reserva/tipos";

export default function SelectorClienteReserva({
  usuarios,
  selectedUserId,
  onCambiar,
}: PropsSelectorClienteReserva) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="cliente-reserva"
        className="text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]"
      >
        Cliente
      </label>
      <select
        id="cliente-reserva"
        name="userId"
        value={selectedUserId}
        onChange={(e) => onCambiar(e.target.value)}
        required
        className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
      >
        <option value="">-- Seleccionar Cliente --</option>
        {usuarios.map((usuario) => (
          <option key={usuario.id} value={usuario.id}>
            {usuario.name || "Sin nombre"} ({usuario.email})
          </option>
        ))}
      </select>
    </div>
  );
}
