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
      aria-pressed={seleccionada}
      onClick={alSeleccionar}
      className={cn(
        "group relative flex min-w-0 flex-col gap-2 rounded-xl border p-3 text-left transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]",
        seleccionada
          ? "border-[var(--page-primary)] bg-[var(--page-primary-soft)]"
          : "border-[var(--admin-border)] bg-[var(--admin-surface)] hover:border-[var(--admin-border-fuerte)]"
      )}
    >
      {seleccionada && (
        <span
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--page-primary)" }}
        >
          <Check className="h-3 w-3" style={{ color: "var(--page-primary-foreground)" }} />
        </span>
      )}
      <p className="pr-6 text-sm font-semibold text-[var(--admin-texto-primario)]">
        {plantilla.nombre}
      </p>
      <div className="flex w-full gap-1 sm:hidden" aria-hidden="true">
        {[plantilla.primaryColor, plantilla.secondaryColor, plantilla.bgColor].map((color, indice) => (
          <span key={indice} className="h-5 flex-1 rounded-md border border-[var(--admin-border)]" style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className="hidden w-full sm:block" aria-hidden="true">
        <VistaPreviaPlantilla plantilla={plantilla} nombreNegocio={nombreNegocio} />
      </div>
      <p className="text-xs leading-snug text-[var(--admin-texto-muted)]">
        {plantilla.descripcion}
      </p>
    </button>
  );
}
