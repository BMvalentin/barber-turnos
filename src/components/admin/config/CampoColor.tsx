// components/admin/config/CampoColor.tsx
import type { ManejarCambio } from "@/components/admin/config/tipos";

interface CampoColorProps {
  nombre: string;
  etiqueta: string;
  valor: string;
  manejarCambio: ManejarCambio;
}

export default function CampoColor({
  nombre,
  etiqueta,
  valor,
  manejarCambio,
}: CampoColorProps) {
  return (
    <div>
      <label htmlFor={`hex-${nombre}`} className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
        {etiqueta}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          name={nombre}
          aria-label={`Seleccionar ${etiqueta.toLowerCase()}`}
          value={valor}
          onChange={manejarCambio}
          className="size-11 shrink-0 cursor-pointer rounded-lg border border-[var(--admin-border)] bg-transparent p-0.5 focus-visible:outline-2 focus-visible:outline-[var(--page-focus-ring)]"
        />
        <input
          type="text"
          id={`hex-${nombre}`}
          name={nombre}
          value={valor}
          onChange={manejarCambio}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 font-mono text-base uppercase text-[var(--admin-texto-primario)] transition-colors hover:border-[var(--admin-border-fuerte)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)] sm:text-sm"
        />
      </div>
    </div>
  );
}
