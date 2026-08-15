// components/admin/config/SeccionPlantillasColores.tsx
import { Sparkles } from "lucide-react";
import EncabezadoSeccion from "@/components/admin/config/EncabezadoSeccion";
import SelectorPlantillasColores from "@/components/admin/config/SelectorPlantillasColores";
import type { AplicarPlantilla } from "@/components/admin/config/tipos";

interface SeccionPlantillasColoresProps {
  colorPrimario: string;
  colorSecundario: string;
  aplicarPlantilla: AplicarPlantilla;
  colorIcono: string;
}

export default function SeccionPlantillasColores({
  colorPrimario,
  colorSecundario,
  aplicarPlantilla,
  colorIcono,
}: SeccionPlantillasColoresProps) {
  return (
    <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
      <EncabezadoSeccion
        icono={<Sparkles className="w-5 h-5" style={{ color: colorIcono }} />}
        titulo="Plantillas de colores"
      />

      <p className="text-sm text-amber-200/60">
        Elegí una combinación para comenzar. Podés personalizar los colores después.
      </p>

      <SelectorPlantillasColores
        colorPrimario={colorPrimario}
        colorSecundario={colorSecundario}
        aplicarPlantilla={aplicarPlantilla}
      />
    </div>
  );
}
