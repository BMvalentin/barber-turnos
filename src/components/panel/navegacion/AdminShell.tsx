"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import AdminSidebar, { MarcaPanel } from "@/components/panel/navegacion/AdminSidebar";
import NavegacionMovilAdmin from "./NavegacionMovilAdmin";
import type { RolPanel } from "@/types/usuario";

const CLAVE_ESTADO = "mayoraz-sidebar-collapsed";
const CLAVE_ANTERIOR = "admin-sidebar-collapsed";
type TemaAdmin = "claro" | "oscuro" | "sistema";

function obtenerColapsadoGuardado(colapsadoInicial: boolean) {
  const cookie = document.cookie
    .split("; ")
    .find((entrada) => entrada.startsWith(`${CLAVE_ESTADO}=`))
    ?.split("=")[1];
  if (cookie === "1" || cookie === "0") return cookie === "1";
  try {
    const valor = window.localStorage.getItem(CLAVE_ESTADO);
    return (valor ?? window.localStorage.getItem(CLAVE_ANTERIOR)) === "1";
  } catch {
    return colapsadoInicial;
  }
}

function suscribirseColapsado(alEscuchar: () => void) {
  window.addEventListener("storage", alEscuchar);
  return () => window.removeEventListener("storage", alEscuchar);
}

interface AdminShellProps {
  children: React.ReactNode;
  config?: { name?: string | null; logo?: string | null } | null;
  rol: RolPanel;
  colapsadoInicial: boolean;
  temaInicial: TemaAdmin;
}

export default function AdminShell({ children, config, rol, colapsadoInicial, temaInicial }: AdminShellProps) {
  const colapsadoGuardado = useSyncExternalStore(
    suscribirseColapsado,
    () => obtenerColapsadoGuardado(colapsadoInicial),
    () => colapsadoInicial,
  );
  const [colapsadoLocal, setColapsadoLocal] = useState<boolean | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [tema, setTema] = useState(temaInicial);
  const pathname = usePathname();
  const contenido = useRef<HTMLElement>(null);

  useEffect(() => {
    const alCambiarAlmacenamiento = (evento: StorageEvent) => {
      if (evento.key === CLAVE_ESTADO) setColapsadoLocal(null);
    };
    window.addEventListener("storage", alCambiarAlmacenamiento);
    return () => window.removeEventListener("storage", alCambiarAlmacenamiento);
  }, []);

  useEffect(() => {
    setMenuAbierto(false);
    contenido.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    const consulta = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    function cerrarEnEscritorio() {
      if (consulta.matches) setMenuAbierto(false);
    }
    consulta.addEventListener("change", cerrarEnEscritorio);
    return () => consulta.removeEventListener("change", cerrarEnEscritorio);
  }, []);

  const colapsado = colapsadoLocal ?? colapsadoGuardado;
  useLayoutEffect(() => {
    if (colapsado) {
      delete document.documentElement.dataset.adminSidebarColapsadoInicial;
    }
  }, [colapsado]);

  const alternarSidebar = () => {
    const siguiente = !colapsado;
    document.cookie = `${CLAVE_ESTADO}=${siguiente ? "1" : "0"}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    try {
      window.localStorage.setItem(CLAVE_ESTADO, siguiente ? "1" : "0");
    } catch {
      // La cookie conserva la preferencia si el almacenamiento local está bloqueado.
    }
    setColapsadoLocal(siguiente);
  };

  function alternarTema() {
    const oscuro = tema === "oscuro" || (tema === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const siguiente = oscuro ? "claro" : "oscuro";
    document.cookie = `mayoraz-admin-tema=${siguiente}; Path=/admin; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    setTema(siguiente);
  }

  return (
    <div data-admin-tema={tema} className="admin-shell flex h-dvh overflow-hidden bg-[var(--admin-background)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] text-[var(--admin-texto-primario)]">
      <a href="#contenido-admin" className="sr-only z-[250] rounded-lg bg-[var(--admin-surface)] p-3 focus:not-sr-only focus:absolute focus:left-3 focus:top-3">
        Saltar al contenido
      </a>
      <AdminSidebar colapsado={colapsado} alAlternar={alternarSidebar} config={config} rol={rol} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:px-8">
          <div className="min-w-0 admin-escritorio:hidden">
            <MarcaPanel config={config} />
          </div>
          <span className="hidden text-sm font-medium text-[var(--admin-texto-secundario)] admin-escritorio:block">
            {rol === "ADMIN" ? "Administración" : "Panel de trabajo"}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/" className="admin-control hidden min-h-10 sm:inline-flex">
              Ver sitio <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
            <button
              type="button"
              onClick={alternarTema}
              className="admin-control size-11 px-0 text-[var(--page-primary-tinta)]"
            >
              <span className="admin-tema-sol"><Sun size={19} aria-hidden="true" /><span className="sr-only">Activar tema claro</span></span>
              <span className="admin-tema-luna"><Moon size={18} aria-hidden="true" /><span className="sr-only">Activar tema oscuro</span></span>
            </button>
          </div>
        </header>
        <main
          id="contenido-admin"
          ref={contenido}
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-y-auto overscroll-contain scroll-pb-[var(--admin-espacio-barra-movil)] admin-escritorio:scroll-pb-0"
        >
          <div className="mx-auto min-h-full w-full max-w-[1328px] px-3.5 pt-5 pb-[var(--admin-espacio-barra-movil)] sm:px-6 lg:px-8 lg:pt-7 admin-escritorio:h-full admin-escritorio:pb-5 admin-escritorio:lg:pb-7">
            {children}
          </div>
        </main>
        <NavegacionMovilAdmin abierto={menuAbierto} alCambiar={setMenuAbierto} ruta={pathname} rol={rol} />
      </div>
    </div>
  );
}
