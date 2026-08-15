import { elegirColorTexto } from "@/lib/contraste/elegir-color-texto";
import type { PlantillaColor } from "@/lib/plantillas-colores";

export default function VistaPreviaPlantilla({ plantilla }: { plantilla: PlantillaColor }) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10 bg-zinc-950">
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: `${plantilla.secondaryColor}26` }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: plantilla.primaryColor }}
          />
          <span className="text-[10px] font-semibold text-zinc-200">Mi Barbería</span>
        </div>
        <span
          className="text-[9px] px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: plantilla.primaryColor,
            color: elegirColorTexto(plantilla.primaryColor),
          }}
        >
          Turnos
        </span>
      </div>
      <div className="px-3 py-3 space-y-2">
        <div className="h-1.5 w-3/4 rounded-full bg-zinc-700" />
        <div className="h-1.5 w-1/2 rounded-full bg-zinc-700" />
        <div className="flex items-center gap-2 pt-1">
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-md"
            style={{
              backgroundColor: plantilla.primaryColor,
              color: elegirColorTexto(plantilla.primaryColor),
            }}
          >
            Reservar
          </span>
          <span
            className="text-[9px] px-2 py-1 rounded-md text-zinc-300"
            style={{ border: `1px solid ${plantilla.secondaryColor}80` }}
          >
            Servicios
          </span>
        </div>
      </div>
      <div
        className="h-1"
        style={{
          backgroundImage: `linear-gradient(to right, ${plantilla.primaryColor}, ${plantilla.secondaryColor})`,
        }}
      />
    </div>
  );
}
