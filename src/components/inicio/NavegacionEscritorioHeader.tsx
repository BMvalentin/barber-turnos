import { ChevronDown, DoorOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { NavegacionEscritorioHeaderProps } from "@/components/inicio/header-tipos";
import { esAdmin, esEmpleado } from "@/lib/seguridad/es-admin";

export function NavegacionEscritorioHeader({ sesion, menuSesionAbierto, setMenuSesionAbierto, contenedorSesion }: NavegacionEscritorioHeaderProps) {
  const claseEnlace = "control-publico inline-flex min-h-11 items-center rounded-md text-sm font-medium text-[var(--admin-texto-secundario)] underline-offset-4 transition-colors hover:text-[var(--admin-texto-primario)] hover:underline";
  const esUsuarioEmpleado = esEmpleado(sesion);
  const destinoTurnos = !sesion
    ? "/login"
    : esAdmin(sesion) || esUsuarioEmpleado
      ? "/admin/turno"
      : "/dashboard?tab=turnos";
  return (
    <div className="hidden shrink-0 items-center gap-4 md:flex lg:gap-6">
      <nav aria-label="Navegación principal" className="flex items-center gap-4 lg:gap-6">
        <Link href="/#servicios" className={claseEnlace}>Servicios</Link><Link href="/#ubicacion" className={claseEnlace}>Ubicación</Link>
        {(esAdmin(sesion) || esUsuarioEmpleado) && <Link href="/admin" className={claseEnlace}>{esUsuarioEmpleado ? "Mi panel" : "Administrador"}</Link>}
      </nav>
      <Link href={destinoTurnos} className="control-publico inline-flex min-h-11 items-center rounded-md border border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] px-3.5 text-sm font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)]">Turnos</Link>
      {sesion ? (
        <div ref={contenedorSesion} className="relative">
          <button type="button" className="control-publico flex min-h-11 items-center gap-2 rounded-md px-2 transition-colors hover:bg-[var(--admin-item-hover)]" onClick={() => setMenuSesionAbierto(!menuSesionAbierto)} aria-expanded={menuSesionAbierto} aria-controls={menuSesionAbierto ? "navegacion-cuenta" : undefined}>
            <Image src={sesion.user?.image || "/images/avatar-default.svg"} alt="" className="rounded-full" width={28} height={28} /><span className="max-w-32 truncate text-sm font-medium text-[var(--admin-texto-primario)]">{sesion.user?.name || "Mi cuenta"}</span><ChevronDown className="size-4 text-[var(--admin-texto-muted)]" aria-hidden="true" />
          </button>
          {menuSesionAbierto && <div id="navegacion-cuenta" className="absolute top-full right-0 mt-2 w-48 rounded-lg border border-[var(--page-separador)] bg-[var(--admin-surface-elevated)] p-1 shadow-lg">
            <Link href="/dashboard" onClick={() => setMenuSesionAbierto(false)} className="control-publico flex min-h-11 items-center rounded-md px-3 text-sm text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]">Mi perfil</Link>
            <form action={() => signOut({ redirectTo: "/" })}><button type="submit" className="control-publico min-h-11 w-full rounded-md px-3 text-left text-sm text-[var(--page-error)] transition-colors hover:bg-[var(--admin-item-hover)]">Cerrar sesión</button></form>
          </div>}
        </div>
      ) : <Link href="/login" className="control-publico flex min-h-11 items-center gap-2 rounded-md px-3.5 text-sm font-medium text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"><DoorOpen className="size-4" aria-hidden="true" />Iniciar sesión</Link>}
    </div>
  );
}
