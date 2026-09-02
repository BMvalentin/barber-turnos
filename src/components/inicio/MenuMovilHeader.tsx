import { DoorOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { handleSignOut } from "@/actions/sesion/logout.actions";
import type { MenuMovilHeaderProps } from "@/components/inicio/header-tipos";
import { esAdmin } from "@/lib/seguridad/es-admin";

export function MenuMovilHeader({ sesion, cerrarMenu }: MenuMovilHeaderProps) {
  const claseEnlace = "py-2 text-base text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)]";
  return (
    <div className="border-t border-[var(--admin-border)] bg-[var(--admin-surface)] md:hidden"><div className="flex flex-col space-y-4 px-6 py-6">
      <Link href="/#servicios" onClick={cerrarMenu} className={claseEnlace}>Servicios</Link><Link href="/#ubicacion" onClick={cerrarMenu} className={claseEnlace}>Ubicación</Link>
      {esAdmin(sesion) && <Link href="/admin" onClick={cerrarMenu} className={claseEnlace}>Administrador</Link>}
      <div className="pt-2"><Link href={sesion ? "/turno" : "/login"} onClick={cerrarMenu} className="block w-full rounded-lg bg-[var(--page-primary)] px-3.5 py-2 text-center text-sm font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)]">Turnos</Link></div>
      <div className="mt-4 border-t border-[var(--admin-border)] pt-6">
        {sesion ? <div className="flex flex-col gap-4">
          <Link href="/dashboard" onClick={cerrarMenu} className="flex items-center gap-3 py-2"><Image src={sesion.user?.image || "/images/avatar-default.svg"} alt="" className="rounded-full" width={40} height={40} /><span className="text-base font-medium text-[var(--admin-texto-primario)]">{sesion.user?.name}</span></Link>
          <form action={handleSignOut} className="w-full"><button type="submit" onClick={cerrarMenu} className="w-full py-2 text-left text-base text-red-500 transition-colors hover:text-red-600">Cerrar sesión</button></form>
        </div> : <Link href="/login" onClick={cerrarMenu} className={`flex items-center gap-2 ${claseEnlace}`}><DoorOpen className="h-4 w-4" />Iniciar Sesión</Link>}
      </div>
    </div></div>
  );
}
