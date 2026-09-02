import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function NavegacionFooter() {
  const enlaces = [{ href: "/", texto: "Inicio" }, { href: "/#servicios", texto: "Servicios" }, { href: "/#ubicacion", texto: "Ubicación" }, { href: "/turno", texto: "Turnos" }];
  return <div><h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">Navegación</h3><nav className="flex flex-col gap-3">
    {enlaces.map((enlace) => <Link key={enlace.href} href={enlace.href} className="group flex items-center gap-2 text-sm text-[var(--admin-texto-secundario)] transition-all hover:translate-x-1 hover:text-[var(--admin-texto-primario)]"><ChevronRight className="h-4 w-4 text-[var(--page-primary-tinta)]" />{enlace.texto}</Link>)}
  </nav></div>;
}
