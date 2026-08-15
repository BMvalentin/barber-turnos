// components/admin/config/NavegacionConfig.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { MODULOS_CONFIG, type IdModuloConfig } from "@/components/admin/config/modulos-config";

interface NavegacionConfigProps {
  seccionActiva: IdModuloConfig;
  alCambiarSeccion: (id: IdModuloConfig) => void;
}

export default function NavegacionConfig({
  seccionActiva,
  alCambiarSeccion,
}: NavegacionConfigProps) {
  return (
    <>
      {/* Navegación móvil: chips horizontales scrolleables */}
      <nav
        aria-label="Secciones de configuración"
        className="sticky top-0 z-10 -mx-1 bg-[var(--admin-background)] px-1 pt-1 lg:hidden"
      >
        <div className="flex gap-2 overflow-x-auto pb-2">
          {MODULOS_CONFIG.map((modulo) => {
            const esActiva = seccionActiva === modulo.id;
            return (
              <button
                key={modulo.id}
                type="button"
                onClick={() => alCambiarSeccion(modulo.id)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  esActiva
                    ? "bg-white/10 text-[var(--admin-texto-primario)]"
                    : "border-[var(--admin-border)] text-[var(--admin-texto-secundario)]"
                )}
              >
                {modulo.etiqueta}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Navegación desktop: columna vertical sticky */}
      <nav
        aria-label="Secciones de configuración"
        className="hidden lg:block lg:w-52 lg:shrink-0"
      >
        <div className="lg:sticky lg:top-20">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]">
            Secciones
          </p>
          <ul className="space-y-1">
            {MODULOS_CONFIG.map((modulo) => {
              const esActiva = seccionActiva === modulo.id;
              return (
                <li key={modulo.id}>
                  <button
                    type="button"
                    onClick={() => alCambiarSeccion(modulo.id)}
                    aria-current={esActiva ? "true" : undefined}
                    className={cn(
                      "block w-full rounded-md px-3 py-1.5 text-left text-sm font-medium transition-colors",
                      esActiva
                        ? "bg-white/5 text-[var(--admin-texto-primario)]"
                        : "text-[var(--admin-texto-secundario)] hover:bg-white/5 hover:text-[var(--admin-texto-primario)]"
                    )}
                  >
                    {modulo.etiqueta}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
