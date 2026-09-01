"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ItemNavegacion } from "@/components/panel/navegacion/items-navegacion";

interface ItemNavegacionEnlaceProps {
  item: ItemNavegacion;
  colapsado: boolean;
  alCerrar: () => void;
}

export default function ItemNavegacionEnlace({
  item,
  colapsado,
  alCerrar,
}: ItemNavegacionEnlaceProps) {
  const pathname = usePathname();
  const Icono = item.icono;
  const esActivo = pathname === item.href;
  const refEnlace = useRef<HTMLAnchorElement>(null);
  const [posicionSugerencia, setPosicionSugerencia] = useState<{
    arriba: number;
    izquierda: number;
  } | null>(null);

  const alEntrar = () => {
    const enlace = refEnlace.current;
    if (!enlace) return;
    const rect = enlace.getBoundingClientRect();
    setPosicionSugerencia({
      arriba: rect.top + rect.height / 2,
      izquierda: rect.right + 10,
    });
  };

  const alSalir = () => setPosicionSugerencia(null);

  return (
    <>
      <Link
        ref={refEnlace}
        href={item.href}
        onClick={alCerrar}
        aria-current={esActivo ? "page" : undefined}
        target={item.externo ? "_blank" : undefined}
        rel={item.externo ? "noopener noreferrer" : undefined}
        onMouseEnter={colapsado ? alEntrar : undefined}
        onMouseLeave={colapsado ? alSalir : undefined}
        onFocus={colapsado ? alEntrar : undefined}
        onBlur={colapsado ? alSalir : undefined}
        className={`
          flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]
          ${colapsado ? "justify-center px-0" : ""}
          ${esActivo
            ? "bg-[var(--page-primary)] text-[var(--page-primary-foreground)]"
            : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-border)] hover:text-[var(--admin-texto-primario)]"}
        `}
      >
        <Icono className="h-4 w-4 shrink-0" />
        <span className={colapsado ? "hidden" : ""}>{item.titulo}</span>
      </Link>
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
            {item.titulo}
          </span>,
          document.body,
        )}
    </>
  );
}
