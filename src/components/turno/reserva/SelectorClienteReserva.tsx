"use client";

import type { PropsSelectorClienteReserva } from "@/components/turno/reserva/tipos";

export default function SelectorClienteReserva({
  usuarios,
  selectedUserId,
  onCambiar,
  esEdicion,
  clienteNombre,
  onCambiarClienteNombre,
  clienteApellido,
  onCambiarClienteApellido,
}: PropsSelectorClienteReserva) {
  const claseCampo = "w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]";

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
        className={claseCampo}
      >
        <option value="">-- Seleccionar Cliente --</option>
        {!esEdicion && <option value="nuevo">+ Nuevo cliente</option>}
        {usuarios.map((usuario) => (
          <option key={usuario.id} value={usuario.id}>
            {usuario.name || "Sin nombre"}
            {(usuario.esInvitado ? usuario.emailContacto : usuario.email)
              ? ` (${usuario.esInvitado ? usuario.emailContacto : usuario.email})`
              : ""}
          </option>
        ))}
      </select>
      {!esEdicion && selectedUserId === "nuevo" && (
        <div className="mt-2 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-[var(--admin-texto-secundario)]">
              Nombre (obligatorio)
              <input
                name="clienteNombre"
                type="text"
                autoComplete="given-name"
                maxLength={95}
                required
                value={clienteNombre}
                onChange={(evento) => onCambiarClienteNombre(evento.target.value)}
                className={claseCampo}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--admin-texto-secundario)]">
              Apellido (obligatorio)
              <input
                name="clienteApellido"
                type="text"
                autoComplete="family-name"
                maxLength={95}
                required
                value={clienteApellido}
                onChange={(evento) => onCambiarClienteApellido(evento.target.value)}
                className={claseCampo}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs text-[var(--admin-texto-secundario)]">
            Celular (opcional)
            <input
              name="clienteTelefono"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              className={claseCampo}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--admin-texto-secundario)]">
            Correo (opcional, para recibir notificaciones)
            <input
              name="clienteEmail"
              type="email"
              autoComplete="email"
              maxLength={191}
              className={claseCampo}
            />
          </label>
        </div>
      )}
    </div>
  );
}
