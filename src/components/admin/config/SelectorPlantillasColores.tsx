// components/admin/config/SelectorPlantillasColores.tsx
import { PLANTILLAS_COLORES } from "@/lib/plantillas-colores";
import TarjetaPlantillaColor from "@/components/admin/config/TarjetaPlantillaColor";
import type { AplicarPlantilla } from "@/components/admin/config/tipos";

interface SelectorPlantillasColoresProps {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  aplicarPlantilla: AplicarPlantilla;
  nombreNegocio: string;
}

export default function SelectorPlantillasColores({
  colorPrimario,
  colorSecundario,
  colorFondo,
  aplicarPlantilla,
  nombreNegocio,
}: SelectorPlantillasColoresProps) {
  const colorCoincide = (colorA: string, colorB: string) =>
    colorA.trim().toUpperCase() === colorB.trim().toUpperCase();

  return (
    <div role="radiogroup" aria-label="Plantillas de colores">
      <div className="max-h-[420px] overflow-y-auto overscroll-contain rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/40 p-3">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
          {PLANTILLAS_COLORES.map((plantilla) => (
            <TarjetaPlantillaColor
              key={plantilla.id}
              plantilla={plantilla}
              seleccionada={
                colorCoincide(plantilla.primaryColor, colorPrimario) &&
                colorCoincide(plantilla.secondaryColor, colorSecundario) &&
                colorCoincide(plantilla.bgColor, colorFondo)
              }
              alSeleccionar={() => aplicarPlantilla(plantilla)}
              nombreNegocio={nombreNegocio}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
