"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, CalendarDays, Ellipsis, LayoutDashboard, Moon, Scissors, Settings, Sun, X } from "lucide-react";
import AdminSidebar, { MarcaPanel } from "@/components/panel/navegacion/AdminSidebar";
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

  const accesos = [
    { href: "/admin", nombre: "Inicio", Icono: LayoutDashboard },
    { href: "/admin/turno", nombre: "Turnos", Icono: CalendarDays },
    rol === "ADMIN"
      ? { href: "/admin/config", nombre: "Ajustes", Icono: Settings }
      : { href: "/admin/servicio", nombre: "Servicios", Icono: Scissors },
  ];
  const claseAcceso = "flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition-colors";

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
        <main id="contenido-admin" ref={contenido} tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto h-full w-full max-w-[1328px] px-3.5 py-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
        <Dialog.Root open={menuAbierto} onOpenChange={setMenuAbierto}>
          <nav aria-label="Accesos rápidos de administración" className="grid shrink-0 grid-cols-4 gap-1 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] admin-escritorio:hidden">
            {accesos.map(({ href, nombre, Icono }) => {
              const activo = pathname === href || (href === "/admin/config"
                && pathname.startsWith("/admin/config/")
                && !pathname.startsWith("/admin/config/empleados/horarios-laborales"));
              return (
                <Link key={href} href={href} aria-current={activo ? "page" : undefined}
                  className={`${claseAcceso} ${activo ? "bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]" : "text-[var(--admin-texto-muted)]"}`}>
                  <Icono size={19} aria-hidden="true" />
                  {nombre}
                </Link>
              );
            })}
            <Dialog.Trigger className={`${claseAcceso} text-[var(--admin-texto-muted)]`}>
              <Ellipsis size={22} aria-hidden="true" />
              Menú
            </Dialog.Trigger>
          </nav>
          <Dialog.Portal>
            <Dialog.Overlay className="admin-menu-fondo fixed inset-0 z-40 bg-black/40" />
            <Dialog.Content
              aria-describedby={undefined}
              className="admin-menu-panel fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[min(88dvh,44rem)] max-w-xl flex-col rounded-t-2xl border border-b-0 border-[var(--admin-border)] bg-[var(--admin-surface)] pb-[env(safe-area-inset-bottom)] outline-none"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[var(--admin-border)] px-4 py-2">
                <Dialog.Title className="text-base font-semibold">Menú</Dialog.Title>
                <Dialog.Close className="admin-control size-11 min-h-0 px-0" aria-label="Cerrar menú">
                  <X size={18} aria-hidden="true" />
                </Dialog.Close>
              </div>
              <AdminSidebar movil colapsado={false} alCerrar={() => setMenuAbierto(false)} rol={rol} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
