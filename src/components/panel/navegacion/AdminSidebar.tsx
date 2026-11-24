"use client";

import Image from "next/image";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, Scissors } from "lucide-react";
import { GRUPOS_NAVEGACION } from "@/components/panel/navegacion/items-navegacion";
import DesplegableNavegacion from "@/components/panel/navegacion/DesplegableNavegacion";
import ItemNavegacionEnlace from "@/components/panel/navegacion/ItemNavegacionEnlace";
import UsuarioSidebar from "@/components/panel/navegacion/UsuarioSidebar";
import type { EntradaNavegacion } from "@/components/panel/navegacion/items-navegacion";
import type { RolPanel } from "@/types/usuario";

function adaptarEntrada(entrada: EntradaNavegacion, rol: RolPanel): EntradaNavegacion {
  if ("href" in entrada) {
    return {
      ...entrada,
      titulo: entrada.tituloPorRol?.[rol] ?? entrada.titulo,
    };
  }

  return {
    ...entrada,
    items: entrada.items
      .filter((item) => !item.roles || item.roles.includes(rol))
      .map((item) => ({
        ...item,
        titulo: item.tituloPorRol?.[rol] ?? item.titulo,
      })),
  };
}

function obtenerNavegacionVisible(rol: RolPanel) {
  return GRUPOS_NAVEGACION.map((grupo) => ({
    ...grupo,
    titulo: grupo.tituloPorRol?.[rol] ?? grupo.titulo,
    items: grupo.items
      .filter((entrada) => "href" in entrada ? (!entrada.roles || entrada.roles.includes(rol)) : true)
      .map((entrada) => adaptarEntrada(entrada, rol)),
  }))
    .map((grupo) => ({
      ...grupo,
      items: grupo.items.filter((entrada) => "href" in entrada || entrada.items.length > 0),
    }))
    .filter((grupo) => grupo.items.length > 0);
}

interface AdminSidebarProps {
  colapsado: boolean;
  alAlternar?: () => void;
  movil?: boolean;
  alCerrar?: () => void;
  config?: { name?: string | null; logo?: string | null } | null;
  rol: RolPanel;
}

export function MarcaPanel({ config }: Pick<AdminSidebarProps, "config">) {
  const marca = config?.name || "Mayoraz";

  return (
    <Link href="/" aria-label={`Ir al sitio de ${marca}`} className="flex min-w-0 items-center gap-2.5 rounded-xl">
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]">
        {config?.logo ? (
          <Image src={config.logo} alt="" width={36} height={36} className="size-full object-cover" />
        ) : (
          <Scissors size={18} aria-hidden="true" />
        )}
      </span>
      <span className="truncate text-sm font-semibold tracking-tight">{marca}</span>
    </Link>
  );
}

export default function AdminSidebar({ colapsado, alAlternar, movil, alCerrar = () => {}, config, rol }: AdminSidebarProps) {
  const gruposVisibles = obtenerNavegacionVisible(rol);
  const IconoPanel = colapsado ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      aria-label="Navegación de administración"
      className={movil
        ? "flex min-h-0 flex-1 flex-col"
        : `hidden h-full shrink-0 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface)] admin-escritorio:flex ${colapsado ? "w-[68px]" : "w-[224px]"}`}
    >
      {!movil && (
        <div className={`flex min-h-16 shrink-0 items-center gap-2 border-b border-[var(--admin-border)] px-3 ${colapsado ? "justify-center" : "justify-between"}`}>
          {!colapsado && <MarcaPanel config={config} />}
          <button
            type="button"
            onClick={alAlternar}
            aria-label={colapsado ? "Expandir navegación" : "Contraer navegación"}
            aria-expanded={!colapsado}
            className="admin-control size-9 min-h-0 shrink-0 border-transparent bg-transparent px-0 text-[var(--admin-texto-muted)]"
          >
            <IconoPanel size={17} aria-hidden="true" />
          </button>
        </div>
      )}
      <nav aria-label="Secciones del panel" className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-width:thin]">
        {gruposVisibles.map((grupo) => (
          <div key={grupo.titulo} className="space-y-0.5">
            <p className={`px-3 pb-1 text-xs font-medium text-[var(--admin-texto-muted)] ${colapsado ? "admin-escritorio:hidden" : ""}`}>{grupo.titulo}</p>
            {grupo.items.map((entrada) => "href" in entrada ? (
              <ItemNavegacionEnlace key={entrada.href} item={entrada} colapsado={colapsado} alCerrar={alCerrar} />
            ) : (
              <DesplegableNavegacion key={entrada.titulo} grupo={entrada} colapsado={colapsado} alCerrar={alCerrar} alExpandirSidebar={alAlternar} />
            ))}
          </div>
        ))}
      </nav>
      <UsuarioSidebar colapsado={colapsado} alCerrar={alCerrar} rol={rol} />
    </aside>
  );
}
