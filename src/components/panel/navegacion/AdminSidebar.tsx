"use client";

import Image from "next/image";
import { ChevronsLeft, ChevronsRight, Scissors } from "lucide-react";
import { GRUPOS_NAVEGACION } from "@/components/panel/navegacion/items-navegacion";
import ItemNavegacionEnlace from "@/components/panel/navegacion/ItemNavegacionEnlace";
import DesplegableNavegacion from "@/components/panel/navegacion/DesplegableNavegacion";

interface AdminSidebarProps {
  colapsado: boolean;
  alAlternar: () => void;
  abierto: boolean;
  alCerrar: () => void;
  config?: { name?: string | null; logo?: string | null } | null;
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
          fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r bg-[var(--admin-surface)] transition-transform duration-200
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
            }             hidden rounded-md p-1.5 text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-border)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] lg:block`}
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
              {grupo.items.map((entrada) =>
                "href" in entrada ? (
                  <ItemNavegacionEnlace
                    key={entrada.href}
                    item={entrada}
                    colapsado={colapsado}
                    alCerrar={alCerrar}
                  />
                ) : (
                  <DesplegableNavegacion
                    key={entrada.titulo}
                    grupo={entrada}
                    colapsado={colapsado}
                    alCerrar={alCerrar}
                  />
                ),
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
