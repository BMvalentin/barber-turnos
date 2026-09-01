"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import ItemNavegacionEnlace from "@/components/panel/navegacion/ItemNavegacionEnlace";
import type { GrupoDesplegable } from "@/components/panel/navegacion/items-navegacion";

interface DesplegableNavegacionProps {
  grupo: GrupoDesplegable;
  colapsado: boolean;
  alCerrar: () => void;
}

export default function DesplegableNavegacion({
  grupo,
  colapsado,
  alCerrar,
}: DesplegableNavegacionProps) {
  const pathname = usePathname();
  const Icono = grupo.icono;
  const [estadoLocal, setEstadoLocal] = useState<boolean | null>(null);
  const contieneHijoActivo = grupo.items.some((item) => pathname === item.href);
  const expandido = estadoLocal ?? contieneHijoActivo;
  const refBoton = useRef<HTMLButtonElement>(null);
  const [posicionSugerencia, setPosicionSugerencia] = useState<{
    arriba: number;
    izquierda: number;
  } | null>(null);

  const alAlternar = () =>
    setEstadoLocal((v) => !(v ?? contieneHijoActivo));

  const alEntrar = () => {
    const boton = refBoton.current;
    if (!boton) return;
    const rect = boton.getBoundingClientRect();
    setPosicionSugerencia({
      arriba: rect.top + rect.height / 2,
      izquierda: rect.right + 10,
    });
  };

  const alSalir = () => setPosicionSugerencia(null);

  return (
    <>
      <button
        ref={refBoton}
        type="button"
        onClick={alAlternar}
        aria-expanded={expandido}
        onMouseEnter={colapsado ? alEntrar : undefined}
        onMouseLeave={colapsado ? alSalir : undefined}
        onFocus={colapsado ? alEntrar : undefined}
        onBlur={colapsado ? alSalir : undefined}
        className={`
          flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]
          ${colapsado ? "justify-center px-0" : ""}
          text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-border)] hover:text-[var(--admin-texto-primario)]
        `}
      >
        <Icono className="h-4 w-4 shrink-0" />
        <span className={colapsado ? "hidden" : ""}>{grupo.titulo}</span>
        {!colapsado &&
          (expandido ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--admin-texto-muted)]" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--admin-texto-muted)]" />
          ))}
      </button>
      {colapsado &&
        posicionSugerencia &&
        createPortal(
          <span
            className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-2.5 py-1.5 text-xs font-medium text-[var(--admin-texto-primario)] shadow-lg"
            style={{
              top: posicionSugerencia.arriba,
              left: posicionSugerencia.izquierda,
            }}
          >
            {grupo.titulo}
          </span>,
          document.body,
        )}
      {expandido && (
        <div
          className={`mt-1 space-y-0.5 ${
            colapsado ? "" : "ml-3 border-l border-[var(--admin-border)] pl-2"
          }`}
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
      )}
    </>
  );
}
