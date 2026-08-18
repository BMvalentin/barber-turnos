"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronsLeft, ChevronsRight, Scissors } from "lucide-react";
import {
  GRUPOS_NAVEGACION,
  type ItemNavegacion,
} from "@/components/panel/navegacion/items-navegacion";

interface AdminSidebarProps {
  colapsado: boolean;
  alAlternar: () => void;
  abierto: boolean;
  alCerrar: () => void;
  config?: { name?: string | null; logo?: string | null } | null;
}

function SidebarItem({
  item,
  colapsado,
  alCerrar,
}: {
  item: ItemNavegacion;
  colapsado: boolean;
  alCerrar: () => void;
}) {
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
            ? "bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]"
            : "text-[var(--admin-texto-secundario)] hover:bg-white/5 hover:text-[var(--admin-texto-primario)]"}
        `}
      >
        <Icono className="h-4 w-4 shrink-0" />
        <span className={colapsado ? "hidden" : ""}>{item.titulo}</span>
      </Link>
      {colapsado &&
        posicionSugerencia &&
        createPortal(
          <span
            className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[var(--admin-surface-elevated)] px-2.5 py-1.5 text-xs font-medium text-[var(--admin-texto-primario)] shadow-lg"
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

export default function AdminSidebar({
  colapsado,
  alAlternar,
  abierto,
  alCerrar,
  config,
}: AdminSidebarProps) {
  return (
    <>
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={alCerrar}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r bg-[var(--admin-background)] transition-transform duration-200
          lg:sticky lg:translate-x-0
          ${abierto ? "translate-x-0" : "-translate-x-full"}
          ${colapsado ? "lg:w-16" : "lg:w-60"}
        `}
        style={{ borderColor: "var(--admin-border)" }}
      >
        <div
          className={`flex h-14 shrink-0 items-center gap-3 border-b transition-all duration-200 ${
            colapsado ? "justify-center px-2" : "px-4"
          }`}
          style={{ borderColor: "var(--admin-border)" }}
        >
          {config?.logo ? (
            <Image
              src={config.logo}
              alt="Logo del negocio"
              width={28}
              height={28}
              className={`shrink-0 rounded object-cover ${
                colapsado ? "hidden" : "h-7 w-7"
              }`}
            />
          ) : (
            <Scissors
              className={`h-6 w-6 shrink-0 ${colapsado ? "hidden" : ""}`}
              style={{ color: "var(--page-primary-tinta)" }}
            />
          )}
          <div
            className={`min-w-0 transition-opacity duration-200 ${
              colapsado ? "hidden opacity-0" : "opacity-100"
            }`}
          >
            <p className="truncate text-sm font-semibold text-[var(--admin-texto-primario)]">
              {config?.name || "Barbería"}
            </p>
            <p className="text-[11px] text-[var(--admin-texto-muted)]">
              Panel de administración
            </p>
          </div>
          <button
            type="button"
            onClick={alAlternar}
            aria-label={colapsado ? "Expandir menú" : "Colapsar menú"}
            title={colapsado ? "Expandir menú" : "Colapsar menú"}
            className={`${
              colapsado ? "" : "ml-auto"
            } hidden rounded-md p-1.5 text-[var(--admin-texto-secundario)] transition-colors hover:bg-white/5 hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] lg:block`}
          >
            {colapsado ? (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronsLeft className="h-4 w-4 shrink-0" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {GRUPOS_NAVEGACION.map((grupo) => (
            <div key={grupo.titulo} className="space-y-0.5">
              {colapsado ? (
                <div className="mx-2 my-2 h-px bg-[var(--admin-border)]" />
              ) : (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]">
                  {grupo.titulo}
                </p>
              )}
              {grupo.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  colapsado={colapsado}
                  alCerrar={alCerrar}
                />
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
