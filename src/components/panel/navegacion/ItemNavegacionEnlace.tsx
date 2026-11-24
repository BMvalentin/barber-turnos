"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import type { ItemNavegacion } from "@/components/panel/navegacion/items-navegacion";
import useSugerenciaLateral from "@/components/panel/navegacion/useSugerenciaLateral";

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
  const { mostrar, ocultar, sugerencia } = useSugerenciaLateral(
    refEnlace,
    item.titulo,
    colapsado,
  );

  return (
    <>
      <Link
        ref={refEnlace}
        href={item.href}
        onClick={alCerrar}
        aria-label={colapsado ? item.titulo : undefined}
        aria-current={esActivo ? "page" : undefined}
        target={item.externo ? "_blank" : undefined}
        rel={item.externo ? "noopener noreferrer" : undefined}
        onMouseEnter={mostrar}
        onMouseLeave={ocultar}
        onFocus={mostrar}
        onBlur={ocultar}
        className={`
          flex min-h-11 items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors duration-150
          ${colapsado ? "admin-escritorio:justify-center admin-escritorio:px-0" : ""}
          ${esActivo
            ? "bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]"
            : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item)] hover:text-[var(--admin-texto-primario)]"}
        `}
      >
        <Icono className="size-[17px] shrink-0" aria-hidden="true" />
        <span className={colapsado ? "admin-escritorio:hidden" : ""}>{item.titulo}</span>
      </Link>
      {sugerencia}
    </>
  );
}
