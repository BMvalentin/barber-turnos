// components/admin/config/SeccionApariencia.tsx
import { Palette } from "lucide-react";
import CampoColor from "@/components/admin/config/CampoColor";
import SelectorPlantillasColores from "@/components/admin/config/SelectorPlantillasColores";
import VistaPreviaPersonalizada from "@/components/admin/config/VistaPreviaPersonalizada";
import type { AplicarPlantilla, ManejarCambio } from "@/components/admin/config/tipos";

interface SeccionAparienciaProps {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  nombreNegocio: string;
  aplicarPlantilla: AplicarPlantilla;
  manejarCambio: ManejarCambio;
}

export default function SeccionApariencia({
  colorPrimario,
  colorSecundario,
  colorFondo,
  nombreNegocio,
  aplicarPlantilla,
  manejarCambio,
}: SeccionAparienciaProps) {
  return (
    <div>
      <div className="border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[var(--admin-texto-muted)]" />
          <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-texto-primario)]">
            Apariencia
          </h2>
        </div>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Elegí una plantilla o personalizá los tres colores de tu marca.
        </p>
      </div>

      <div className="mt-6 space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-texto-primario)]">
            Plantillas de colores
          </h3>
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">
            Elegí una combinación para comenzar. Podés personalizar los colores después.
          </p>
          <div className="mt-3">
            <SelectorPlantillasColores
              colorPrimario={colorPrimario}
              colorSecundario={colorSecundario}
              colorFondo={colorFondo}
              aplicarPlantilla={aplicarPlantilla}
              nombreNegocio={nombreNegocio}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-texto-primario)]">
            Colores personalizados
          </h3>
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">
            Solo necesitás tres colores: el sistema deriva el resto automáticamente.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <CampoColor
              nombre="primaryColor"
              etiqueta="Color primario"
              valor={colorPrimario}
              manejarCambio={manejarCambio}
            />
            <CampoColor
              nombre="secondaryColor"
              etiqueta="Color secundario"
              valor={colorSecundario}
              manejarCambio={manejarCambio}
            />
            <CampoColor
              nombre="bgColor"
              etiqueta="Color de fondo"
              valor={colorFondo}
              manejarCambio={manejarCambio}
            />
          </div>
          <div className="mt-4">
            <VistaPreviaPersonalizada
              colorPrimario={colorPrimario}
              colorSecundario={colorSecundario}
              colorFondo={colorFondo}
              nombreNegocio={nombreNegocio}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
