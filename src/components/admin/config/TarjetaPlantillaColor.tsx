// components/admin/config/TarjetaPlantillaColor.tsx
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import VistaPreviaPlantilla from "@/components/admin/config/VistaPreviaPlantilla";
import type { PlantillaColor } from "@/lib/plantillas-colores";

interface TarjetaPlantillaColorProps {
  plantilla: PlantillaColor;
  seleccionada: boolean;
  alSeleccionar: () => void;
  nombreNegocio: string;
}

export default function TarjetaPlantillaColor({
  plantilla,
  seleccionada,
  alSeleccionar,
  nombreNegocio,
}: TarjetaPlantillaColorProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionada}
      onClick={alSeleccionar}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-3 text-left transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]",
        seleccionada
          ? "border-[var(--page-primary)] bg-[var(--page-primary-soft)]/40 ring-1 ring-[var(--page-primary)]/40"
          : "border-[var(--admin-border)] bg-[var(--admin-surface)] hover:-translate-y-0.5 hover:border-[var(--admin-border-fuerte)] hover:shadow-lg hover:shadow-black/20"
      )}
    >
      {seleccionada && (
        <span
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--page-primary)" }}
        >
          <Check className="h-3 w-3" style={{ color: "var(--page-primary-foreground)" }} />
          <span className="sr-only">Seleccionada</span>
        </span>
      )}
      <p className="text-sm font-semibold text-[var(--admin-texto-primario)]">
        {plantilla.nombre}
      </p>
      <VistaPreviaPlantilla plantilla={plantilla} nombreNegocio={nombreNegocio} />
      <p className="text-xs leading-snug text-[var(--admin-texto-muted)]">
        {plantilla.descripcion}
      </p>
    </button>
  );
}
