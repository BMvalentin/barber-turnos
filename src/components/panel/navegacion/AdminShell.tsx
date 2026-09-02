"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import Image from "next/image";
import { Menu, Scissors } from "lucide-react";
import AdminSidebar from "@/components/panel/navegacion/AdminSidebar";

const CLAVE_ESTADO = "mayoraz-sidebar-collapsed";
const CLAVE_ANTERIOR = "admin-sidebar-collapsed";

function obtenerColapsadoGuardado() {
  const valor = window.localStorage.getItem(CLAVE_ESTADO);
  return (valor ?? window.localStorage.getItem(CLAVE_ANTERIOR)) === "1";
}

function suscribirseColapsado(alEscuchar: () => void) {
  window.addEventListener("storage", alEscuchar);
  return () => window.removeEventListener("storage", alEscuchar);
}

interface AdminShellProps {
  children: React.ReactNode;
  config?: { name?: string | null; logo?: string | null } | null;
}

export default function AdminShell({ children, config }: AdminShellProps) {
  const colapsadoGuardado = useSyncExternalStore(
    suscribirseColapsado,
    obtenerColapsadoGuardado,
    () => false,
  );
  const [colapsadoLocal, setColapsadoLocal] = useState<boolean | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const alCambiarAlmacenamiento = (evento: StorageEvent) => {
      if (evento.key === CLAVE_ESTADO) setColapsadoLocal(null);
    };
    window.addEventListener("storage", alCambiarAlmacenamiento);
    return () => window.removeEventListener("storage", alCambiarAlmacenamiento);
  }, []);

  const colapsado = colapsadoLocal ?? colapsadoGuardado;
  const marca = config?.name || "Mayoraz";

  const handleToggle = () => {
    const siguiente = !colapsado;
    window.localStorage.setItem(CLAVE_ESTADO, siguiente ? "1" : "0");
    setColapsadoLocal(siguiente);
  };

  useEffect(() => {
    if (!menuAbierto) return;
    const alPresionarEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setMenuAbierto(false);
    };
    document.addEventListener("keydown", alPresionarEscape);
    return () => document.removeEventListener("keydown", alPresionarEscape);
  }, [menuAbierto]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--admin-background)] text-[var(--admin-texto-primario)]">
      <AdminSidebar
        colapsado={colapsado}
        alAlternar={handleToggle}
        abierto={menuAbierto}
        alCerrar={() => setMenuAbierto(false)}
        config={config}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            className="rounded-md p-2 text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-border)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            {config?.logo ? (
              <Image
                src={config.logo}
                alt={`Logo de ${marca}`}
                width={30}
                height={30}
                className="h-[30px] w-[30px] shrink-0 rounded-md object-cover"
              />
            ) : (
              <Scissors
                className="h-6 w-6 shrink-0 text-[var(--page-primary-tinta)]"
                aria-hidden="true"
              />
            )}
            <span className="truncate text-sm font-semibold text-[var(--admin-texto-primario)]">
              {marca}
            </span>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
