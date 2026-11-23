// components/admin/config/SeccionContacto.tsx
import { MapPin } from "lucide-react";
import type { ManejarCambio } from "@/components/admin/config/tipos";

const CLASES_INPUT =
  "w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] transition-colors duration-150 hover:border-[var(--admin-border-fuerte)] focus:border-[var(--page-primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]";

interface SeccionContactoProps {
  whatsapp: string;
  mapsUrl: string;
  direccion: string;
  manejarCambio: ManejarCambio;
}

export default function SeccionContacto({
  whatsapp,
  mapsUrl,
  direccion,
  manejarCambio,
}: SeccionContactoProps) {
  return (
    <div>
      <div className="border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[var(--admin-texto-muted)]" />
          <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-texto-primario)]">
            Datos de contacto
          </h2>
        </div>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Estos datos se muestran en el sitio de reservas.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="config-whatsapp" className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            WhatsApp
          </label>
          <input
            type="text"
            id="config-whatsapp"
            inputMode="tel"
            name="whatsapp"
            value={whatsapp}
            onChange={manejarCambio}
            placeholder="Ej: 5491112345678"
            className={CLASES_INPUT}
          />
        </div>
        <div>
          <label htmlFor="config-mapa" className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            URL del mapa insertado
          </label>
          <input
            type="text"
            id="config-mapa"
            name="mapsUrl"
            value={mapsUrl}
            onChange={manejarCambio}
            placeholder="Pegá el link del src del mapa"
            className={CLASES_INPUT}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="config-direccion" className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            Dirección del local
          </label>
          <input
            type="text"
            id="config-direccion"
            name="address"
            value={direccion}
            onChange={manejarCambio}
            placeholder="Ej: Av. Montreal 695"
            className={CLASES_INPUT}
          />
        </div>
      </div>
    </div>
  );
}
