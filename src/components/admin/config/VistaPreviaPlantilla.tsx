// components/admin/config/VistaPreviaPlantilla.tsx
import { crearVariablesTema } from "@/lib/contraste/crear-variables-tema";
import type { PlantillaColor } from "@/lib/plantillas-colores";

const CHIPS_FANTASMA = ["Servicios", "Barberos", "Ubicación"];

interface VistaPreviaPlantillaProps {
  plantilla: PlantillaColor;
  nombreNegocio: string;
}

export default function VistaPreviaPlantilla({
  plantilla,
  nombreNegocio,
}: VistaPreviaPlantillaProps) {
  const variablesTema = crearVariablesTema({
    primario: plantilla.primaryColor,
    secundario: plantilla.secondaryColor,
    fondo: plantilla.bgColor,
  });

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{
        ...variablesTema,
        backgroundColor: "var(--tema-fondo)",
        borderColor: "var(--tema-borde-suave)",
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          backgroundColor: "var(--tema-secundario-suave)",
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--tema-primario-texto)" }}
          />
          <span
            className="truncate text-[10px] font-semibold"
            style={{ color: "var(--tema-texto-principal)" }}
          >
            {nombreNegocio.trim() || "Mi Barbería"}
          </span>
        </div>
        <span
          className="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
          style={{
            backgroundColor: "var(--tema-primario)",
            color: "var(--tema-primario-sobre)",
          }}
        >
          Turnos
        </span>
      </div>

      <div className="space-y-2 px-3 py-3">
        <div className="h-1.5 w-3/4 rounded-full bg-[var(--tema-texto-secundario)]" />
        <div className="h-1.5 w-1/2 rounded-full bg-[var(--tema-texto-tenue)]" />
        <div className="pt-1">
          <span
            className="rounded-md px-2.5 py-1 text-[10px] font-semibold"
            style={{
              backgroundColor: "var(--tema-primario)",
              color: "var(--tema-primario-sobre)",
            }}
          >
            Reservar
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
        {CHIPS_FANTASMA.map((chip) => (
          <span
            key={chip}
            className="rounded-md border px-2 py-1 text-[9px]"
            style={{
              backgroundColor: "var(--tema-secundario-suave)",
              borderColor: "var(--tema-borde-suave)",
              color: "var(--tema-secundario-suave-texto)",
            }}
          >
            {chip}
          </span>
        ))}
      </div>

      <div
        className="h-[3px]"
        style={{
          backgroundImage: "linear-gradient(to right, var(--tema-primario), var(--tema-secundario))",
        }}
      />
    </div>
  );
}
