import { DoorOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { handleSignOut } from "@/actions/sesion/logout.actions";
import type { MenuMovilHeaderProps } from "@/components/inicio/header-tipos";
import { esAdmin, esEmpleado } from "@/lib/seguridad/es-admin";

export function MenuMovilHeader({ sesion, cerrarMenu }: MenuMovilHeaderProps) {
  const claseEnlace = "control-publico flex min-h-11 items-center gap-2 rounded-md px-2 text-base text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item)] hover:text-[var(--admin-texto-primario)]";
  const esUsuarioEmpleado = esEmpleado(sesion);
  const destinoTurnos = !sesion
    ? "/login"
    : esAdmin(sesion) || esUsuarioEmpleado
      ? "/admin/turno"
      : "/dashboard?tab=turnos";
  return (
    <nav id="navegacion-movil" aria-label="Navegación principal" className="flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto overscroll-contain border-b border-[var(--page-separador)] bg-[var(--admin-surface)] px-4 py-3 shadow-lg sm:px-6 md:hidden">
      <Link href="/#servicios" onClick={cerrarMenu} className={claseEnlace}>Servicios</Link>
      <Link href="/#ubicacion" onClick={cerrarMenu} className={claseEnlace}>Ubicación</Link>
      {(esAdmin(sesion) || esUsuarioEmpleado) && <Link href="/admin" onClick={cerrarMenu} className={claseEnlace}>{esUsuarioEmpleado ? "Mi panel" : "Administrador"}</Link>}
      <Link href={destinoTurnos} onClick={cerrarMenu} className="control-publico mt-2 grid min-h-11 place-items-center rounded-md border border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] px-4 text-sm font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)]">Turnos</Link>
      <div className="mt-2 border-t border-[var(--page-separador)] pt-2">
        {sesion ? <div className="flex flex-col gap-1">
          <Link href="/dashboard" onClick={cerrarMenu} className={claseEnlace}><Image src={sesion.user?.image || "/images/avatar-default.svg"} alt="" className="shrink-0 rounded-full" width={28} height={28} /><span className="min-w-0 break-words">{sesion.user?.name || "Mi perfil"}</span></Link>
          <form action={handleSignOut}><button type="submit" className="control-publico min-h-11 w-full rounded-md px-2 text-left text-base text-[var(--page-error)] transition-colors hover:bg-[var(--admin-item)]">Cerrar sesión</button></form>
        </div> : <Link href="/login" onClick={cerrarMenu} className={claseEnlace}><DoorOpen className="size-4" aria-hidden="true" />Iniciar sesión</Link>}
      </div>
    </nav>
  );
}
