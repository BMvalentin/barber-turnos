// components/admin/config/SeccionIdentidad.tsx
import { Building2 } from "lucide-react";
import type { ManejarCambio } from "@/components/admin/config/tipos";

const CLASES_INPUT =
  "w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] transition-colors duration-150 hover:border-[var(--admin-border-fuerte)] focus:border-[var(--page-primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]";

interface SeccionIdentidadProps {
  nombre: string;
  slogan: string;
  descripcion: string;
  manejarCambio: ManejarCambio;
}

export default function SeccionIdentidad({
  nombre,
  slogan,
  descripcion,
  manejarCambio,
}: SeccionIdentidadProps) {
  return (
    <div>
      <div className="border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[var(--admin-texto-muted)]" />
          <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-texto-primario)]">
            Información general
          </h2>
        </div>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Nombre, slogan y descripción que se muestran en tu sitio.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            Nombre del Negocio
          </label>
          <input
            type="text"
            name="name"
            value={nombre}
            onChange={manejarCambio}
            className={CLASES_INPUT}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            Slogan
          </label>
          <input
            type="text"
            name="slogan"
            value={slogan}
            onChange={manejarCambio}
            className={CLASES_INPUT}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
          Descripción
        </label>
        <textarea
          name="description"
          rows={3}
          value={descripcion}
          onChange={manejarCambio}
          className={CLASES_INPUT}
        />
      </div>
    </div>
  );
}
