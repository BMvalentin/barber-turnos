import { ChevronDown, DoorOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { handleSignOut } from "@/actions/sesion/logout.actions";
import type { NavegacionEscritorioHeaderProps } from "@/components/inicio/header-tipos";
import { esAdmin } from "@/lib/seguridad/es-admin";

export function NavegacionEscritorioHeader({ sesion, menuSesionAbierto, setMenuSesionAbierto, contenedorSesion }: NavegacionEscritorioHeaderProps) {
  const claseEnlace = "text-sm font-medium text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)]";
  return (
    <div className="hidden items-center gap-6 md:flex">
      <nav className="flex items-center gap-6">
        <Link href="/#servicios" className={claseEnlace}>Servicios</Link><Link href="/#ubicacion" className={claseEnlace}>Ubicación</Link>
        {esAdmin(sesion) && <Link href="/admin" className={claseEnlace}>Administrador</Link>}
      </nav>
      <Link href={sesion ? "/turno" : "/login"} className="rounded-lg bg-[var(--page-primary)] px-3.5 py-2 text-sm font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)]">Turnos</Link>
      {sesion ? (
        <div ref={contenedorSesion} className="relative">
          <button type="button" className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--admin-item-hover)]" onClick={() => setMenuSesionAbierto(!menuSesionAbierto)} aria-expanded={menuSesionAbierto} aria-haspopup="menu">
            <Image src={sesion.user?.image || "/images/avatar-default.svg"} alt="" className="rounded-full" width={28} height={28} /><span className="hidden text-sm font-medium text-[var(--admin-texto-primario)] sm:inline">{sesion.user?.name}</span><ChevronDown className="h-4 w-4 text-[var(--admin-texto-muted)]" />
          </button>
          {menuSesionAbierto && <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] py-1 shadow-xl">
            <Link href="/dashboard" onClick={() => setMenuSesionAbierto(false)} className="block w-full rounded-md px-3 py-2 text-sm text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]">Mi perfil</Link>
            <form action={handleSignOut}><button type="submit" onClick={() => setMenuSesionAbierto(false)} className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10">Cerrar sesión</button></form>
          </div>}
        </div>
      ) : <Link href="/login" className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"><DoorOpen className="h-4 w-4" />Iniciar Sesión</Link>}
    </div>
  );
}
