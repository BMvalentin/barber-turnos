import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import VistaPreviaPlantilla from "@/components/admin/config/VistaPreviaPlantilla";
import type { PlantillaColor } from "@/lib/plantillas-colores";

interface TarjetaPlantillaColorProps {
  plantilla: PlantillaColor;
  seleccionada: boolean;
  alSeleccionar: () => void;
}

export default function TarjetaPlantillaColor({
  plantilla,
  seleccionada,
  alSeleccionar,
}: TarjetaPlantillaColorProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionada}
      onClick={alSeleccionar}
      className={cn(
        "relative flex flex-col gap-2 text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer",
        "bg-black/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-primary)]",
        seleccionada
          ? "border-[var(--page-primary)] ring-1 ring-[var(--page-primary)]/40"
          : "border-amber-900/30 hover:border-[var(--page-primary)]/50"
      )}
    >
      {seleccionada && (
        <span
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--page-primary)" }}
        >
          <Check className="w-3.5 h-3.5" style={{ color: "var(--page-primary-foreground)" }} />
          <span className="sr-only">Seleccionada</span>
        </span>
      )}
      <p className="text-sm font-semibold text-white">{plantilla.nombre}</p>
      <VistaPreviaPlantilla plantilla={plantilla} />
      <p className="text-[11px] leading-snug text-amber-200/60">{plantilla.descripcion}</p>
    </button>
  );
}
