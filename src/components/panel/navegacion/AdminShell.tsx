"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import AdminSidebar from "@/components/panel/navegacion/AdminSidebar";
import AdminTopbar from "@/components/panel/navegacion/AdminTopbar";

const STORAGE_KEY = "admin-sidebar-collapsed";

function obtenerColapsadoGuardado() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
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
      if (evento.key === STORAGE_KEY) setColapsadoLocal(null);
    };
    window.addEventListener("storage", alCambiarAlmacenamiento);
    return () => window.removeEventListener("storage", alCambiarAlmacenamiento);
  }, []);

  const colapsado = colapsadoLocal ?? colapsadoGuardado;

  const handleToggle = () => {
    const siguiente = !colapsado;
    window.localStorage.setItem(STORAGE_KEY, siguiente ? "1" : "0");
    setColapsadoLocal(siguiente);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--admin-background)] text-[var(--admin-texto-primario)]">
      <AdminSidebar
        colapsado={colapsado}
        alAlternar={handleToggle}
        abierto={menuAbierto}
        alCerrar={() => setMenuAbierto(false)}
        config={config}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          menuAbierto={menuAbierto}
          alAlternarMenu={() => setMenuAbierto((v) => !v)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
