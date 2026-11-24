interface InterruptorAdminProps {
  etiqueta: string;
  activo: boolean;
  alCambiar: (activo: boolean) => void;
}

export function InterruptorAdmin({ etiqueta, activo, alCambiar }: InterruptorAdminProps) {
  return (
    <label className="relative inline-flex min-h-11 shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        role="switch"
        aria-label={etiqueta}
        checked={activo}
        onChange={(evento) => alCambiar(evento.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 rounded-full bg-[var(--admin-texto-muted)] transition-colors duration-150 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-[var(--admin-surface)] after:shadow-sm after:transition-transform after:duration-150 peer-checked:bg-[var(--page-primary)] peer-checked:after:translate-x-5 peer-checked:after:bg-[var(--page-primary-foreground)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--page-focus-ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--admin-surface)] motion-reduce:transition-none motion-reduce:after:transition-none"
      />
    </label>
  );
}
