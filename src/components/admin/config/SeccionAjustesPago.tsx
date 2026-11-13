interface SeccionAjustesPagoProps {
  mostrarAvisoSeniaPendiente: boolean;
  manejarCambio: (activo: boolean) => void;
}

export default function SeccionAjustesPago({
  mostrarAvisoSeniaPendiente,
  manejarCambio,
}: SeccionAjustesPagoProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8">
      <div className="min-w-0">
        <p className="text-base font-semibold text-[var(--admin-texto-primario)]">
          Mostrar aviso de seña pendiente
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--admin-texto-muted)]">
          Mostrar una advertencia al cliente indicando que su turno no estará confirmado hasta que abone la seña.
        </p>
      </div>
      <label className="flex shrink-0 cursor-pointer items-center gap-3 self-start sm:self-auto">
        <span className="text-sm font-medium text-[var(--admin-texto-secundario)]">
          {mostrarAvisoSeniaPendiente ? "Activo" : "Inactivo"}
        </span>
        <input
          type="checkbox"
          checked={mostrarAvisoSeniaPendiente}
          onChange={(evento) => manejarCambio(evento.target.checked)}
          aria-label="Mostrar aviso de seña pendiente"
          role="switch"
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-11 shrink-0 rounded-full border border-[var(--admin-border-fuerte)] bg-[var(--admin-item)] transition-colors duration-300 ease-in-out after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-[var(--admin-texto-primario)] after:transition-[transform,background-color] after:duration-300 after:ease-in-out peer-checked:border-[var(--page-primary)] peer-checked:bg-[var(--page-primary)] peer-checked:after:translate-x-5 peer-checked:after:bg-[var(--page-primary-foreground)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--page-focus-ring)]"
        />
      </label>
    </div>
  );
}
