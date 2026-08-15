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
      <label className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
        {etiqueta}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          name={nombre}
          value={valor}
          onChange={manejarCambio}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border bg-transparent p-0.5"
          style={{ borderColor: "var(--admin-border)" }}
        />
        <input
          type="text"
          name={nombre}
          value={valor}
          onChange={manejarCambio}
          className="w-full flex-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2.5 font-mono text-sm uppercase text-[var(--admin-texto-primario)] transition-colors duration-150 hover:border-[var(--admin-border-fuerte)] focus:border-[var(--page-primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
        />
      </div>
    </div>
  );
}
