"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import ItemNavegacionEnlace from "@/components/panel/navegacion/ItemNavegacionEnlace";
import type { GrupoDesplegable } from "@/components/panel/navegacion/items-navegacion";
import useSugerenciaLateral from "@/components/panel/navegacion/useSugerenciaLateral";

interface DesplegableNavegacionProps {
  grupo: GrupoDesplegable;
  colapsado: boolean;
  alCerrar: () => void;
  alExpandirSidebar?: () => void;
}

function suscribirseConsultaEscritorio(alCambiar: () => void) {
  const consulta = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
  consulta.addEventListener("change", alCambiar);
  return () => consulta.removeEventListener("change", alCambiar);
}

function obtenerConsultaEscritorio() {
  return window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches;
}

export default function DesplegableNavegacion({
  grupo,
  colapsado,
  alCerrar,
  alExpandirSidebar,
}: DesplegableNavegacionProps) {
  const pathname = usePathname();
  const Icono = grupo.icono;
  const [estadoLocal, setEstadoLocal] = useState<boolean | null>(null);
  const estaEnEscritorio = useSyncExternalStore(
    suscribirseConsultaEscritorio,
    obtenerConsultaEscritorio,
    () => true,
  );
  const contieneHijoActivo = grupo.items.some((item) => pathname === item.href);
  const expandido = estadoLocal ?? contieneHijoActivo;
  const muestraContenido = expandido && !(colapsado && estaEnEscritorio);
  const identificadorContenido = useId();
  const refBoton = useRef<HTMLButtonElement>(null);
  const { mostrar, ocultar, sugerencia } = useSugerenciaLateral(
    refBoton,
    grupo.titulo,
    colapsado,
  );

  const alAlternar = () => {
    if (colapsado && estaEnEscritorio) {
      alExpandirSidebar?.();
      setEstadoLocal(true);
      return;
    }
    setEstadoLocal((valor) => !(valor ?? contieneHijoActivo));
  };

  return (
    <>
      <button
        ref={refBoton}
        type="button"
        onClick={alAlternar}
        aria-expanded={muestraContenido}
        aria-controls={identificadorContenido}
        aria-label={colapsado ? grupo.titulo : undefined}
        onMouseEnter={mostrar}
        onMouseLeave={ocultar}
        onFocus={mostrar}
        onBlur={ocultar}
        className={`
          flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm font-medium transition-colors duration-150
          ${colapsado ? "admin-escritorio:justify-center admin-escritorio:px-0" : ""}
          ${contieneHijoActivo
            ? "bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]"
            : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item)] hover:text-[var(--admin-texto-primario)]"}
        `}
      >
        <Icono className="size-[17px] shrink-0" aria-hidden="true" />
        <span className={colapsado ? "admin-escritorio:hidden" : ""}>{grupo.titulo}</span>
        <span className={`ml-auto ${colapsado ? "admin-escritorio:hidden" : ""}`}>
          <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[var(--admin-texto-muted)] transition-transform duration-150 ease-[var(--admin-ease-out)] motion-reduce:transition-none ${muestraContenido ? "rotate-180" : ""}`} />
        </span>
      </button>
      {sugerencia}
      <div
        id={identificadorContenido}
        hidden={!muestraContenido}
        className="mt-1 space-y-0.5 pl-3"
      >
        {grupo.items.map((item) => (
          <ItemNavegacionEnlace
            key={item.href}
            item={item}
            colapsado={colapsado}
            alCerrar={alCerrar}
          />
        ))}
      </div>
    </>
  );
}
