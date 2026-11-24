"use client";

import type { FilterState } from "@/hooks/useFiltrosServicios";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";

type CamposFiltrosProps = {
  filtros: FilterState;
  onCambiarFiltro: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
};

const OPCIONES_ORDEN = [
  { valor: "reciente", etiqueta: "Más recientes" },
  { valor: "nombre", etiqueta: "Nombre de A a Z" },
  { valor: "precio_asc", etiqueta: "Menor precio" },
  { valor: "precio_desc", etiqueta: "Mayor precio" },
  { valor: "duracion", etiqueta: "Menor duración" },
];

const OPCIONES_ESTADO = [
  { valor: "", etiqueta: "Todos" },
  { valor: "true", etiqueta: "Activos" },
  { valor: "false", etiqueta: "Inactivos" },
];

const CAMPOS_NUMERICOS = [
  { clave: "precioMin", etiqueta: "Precio desde ($)", minimo: 0 },
  { clave: "precioMax", etiqueta: "Precio hasta ($)", minimo: 0 },
  { clave: "duracionMax", etiqueta: "Duración hasta (min)", minimo: 1 },
] as const;

export default function CamposFiltros({ filtros, onCambiarFiltro }: CamposFiltrosProps) {
  return (
    <div className="grid grid-cols-2 gap-3 border-t border-[var(--admin-border)] pt-4 md:grid-cols-3 lg:grid-cols-5">
      <div className="min-w-0 space-y-1.5">
        <p className="text-xs font-medium text-[var(--admin-texto-secundario)]">Estado</p>
        <SelectorDesplegable
          opciones={OPCIONES_ESTADO}
          valor={filtros.estado}
          onChange={(valor) => onCambiarFiltro("estado", valor)}
          etiquetaAria="Estado del servicio"
          claseBoton="min-h-11 rounded-xl"
        />
      </div>
      <div className="min-w-0 space-y-1.5">
        <p className="text-xs font-medium text-[var(--admin-texto-secundario)]">Orden</p>
        <SelectorDesplegable
          opciones={OPCIONES_ORDEN}
          valor={filtros.ordenPor}
          onChange={(valor) => onCambiarFiltro("ordenPor", valor)}
          etiquetaAria="Orden de los servicios"
          claseBoton="min-h-11 rounded-xl"
        />
      </div>
      {CAMPOS_NUMERICOS.map(({ clave, etiqueta, minimo }) => (
        <label key={clave} className="min-w-0 space-y-1.5">
          <span className="block text-xs font-medium text-[var(--admin-texto-secundario)]">{etiqueta}</span>
          <input
            type="number"
            min={minimo}
            value={filtros[clave]}
            onChange={(evento) => onCambiarFiltro(clave, evento.target.value)}
            className="min-h-11 w-full rounded-xl border border-[var(--admin-border-fuerte)] bg-[var(--admin-surface)] px-3 text-base sm:text-sm"
          />
        </label>
      ))}
    </div>
  );
}
