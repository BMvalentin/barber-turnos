import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function NavegacionFooter() {
  const enlaces = [{ href: "/", texto: "Inicio" }, { href: "/#servicios", texto: "Servicios" }, { href: "/#ubicacion", texto: "Ubicación" }, { href: "/dashboard?tab=turnos", texto: "Turnos" }];
  return <div><h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">Navegación</h3><nav aria-label="Navegación al pie" className="flex flex-col items-start">
    {enlaces.map((enlace) => <Link key={enlace.href} href={enlace.href} className="control-publico flex min-h-11 items-center gap-2 rounded-md text-sm text-[var(--admin-texto-secundario)] underline-offset-4 hover:text-[var(--admin-texto-primario)] hover:underline"><ChevronRight className="size-4 shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />{enlace.texto}</Link>)}
  </nav></div>;
}
