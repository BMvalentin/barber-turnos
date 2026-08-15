// components/admin/config/SelectorPlantillasColores.tsx
import { PLANTILLAS_COLORES } from "@/lib/plantillas-colores";
import TarjetaPlantillaColor from "@/components/admin/config/TarjetaPlantillaColor";
import type { AplicarPlantilla } from "@/components/admin/config/tipos";

interface SelectorPlantillasColoresProps {
  colorPrimario: string;
  colorSecundario: string;
  aplicarPlantilla: AplicarPlantilla;
}

export default function SelectorPlantillasColores({
  colorPrimario,
  colorSecundario,
  aplicarPlantilla,
}: SelectorPlantillasColoresProps) {
  const colorCoincide = (colorA: string, colorB: string) =>
    colorA.trim().toUpperCase() === colorB.trim().toUpperCase();

  return (
    <div
      role="radiogroup"
      aria-label="Plantillas de colores"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {PLANTILLAS_COLORES.map((plantilla) => (
        <TarjetaPlantillaColor
          key={plantilla.id}
          plantilla={plantilla}
          seleccionada={
            colorCoincide(plantilla.primaryColor, colorPrimario) &&
            colorCoincide(plantilla.secondaryColor, colorSecundario)
          }
          alSeleccionar={() => aplicarPlantilla(plantilla)}
        />
      ))}
    </div>
  );
}
