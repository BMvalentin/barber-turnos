"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Scissors, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MenuMovilHeader } from "@/components/inicio/MenuMovilHeader";
import { NavegacionEscritorioHeader } from "@/components/inicio/NavegacionEscritorioHeader";
import type { HeaderProps } from "@/components/inicio/header-tipos";

export function Header({ config }: HeaderProps) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuSesionAbierto, setMenuSesionAbierto] = useState(false);
  const header = useRef<HTMLElement>(null);
  const botonMovil = useRef<HTMLButtonElement>(null);
  const contenedorSesion = useRef<HTMLDivElement>(null);
  const { data: sesion } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (!menuMovilAbierto && !menuSesionAbierto) return;

    const cerrarAlHacerClickFuera = (evento: PointerEvent) => {
      if (!(evento.target instanceof Node)) return;
      if (!header.current?.contains(evento.target)) setMenuMovilAbierto(false);
      if (!contenedorSesion.current?.contains(evento.target)) setMenuSesionAbierto(false);
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.defaultPrevented || evento.key !== "Escape") return;
      if (menuMovilAbierto && botonMovil.current?.getClientRects().length) {
        botonMovil.current.focus();
      } else if (menuSesionAbierto) {
        contenedorSesion.current?.querySelector("button")?.focus();
      }
      setMenuMovilAbierto(false);
      setMenuSesionAbierto(false);
    };
    document.addEventListener("pointerdown", cerrarAlHacerClickFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarAlHacerClickFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [menuMovilAbierto, menuSesionAbierto]);

  const nombreNegocio = config?.name || "";
  const [primerNombre, ...restoNombre] = nombreNegocio.split(" ");

  return (
    <header ref={header} className="fixed inset-x-0 top-0 z-50 h-16 w-full border-b border-[var(--page-separador)] bg-[var(--admin-surface)] text-[var(--admin-texto-primario)]">
      {pathname === "/" && <a href="#contenido-inicio" className="control-publico sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-4 focus:z-10 focus:rounded-md focus:bg-[var(--admin-surface)] focus:px-4 focus:py-2">Ir al contenido</a>}
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/#home" aria-label={nombreNegocio ? `Inicio de ${nombreNegocio}` : "Inicio"} onClick={() => setMenuMovilAbierto(false)} className="control-publico flex min-h-11 min-w-0 items-center gap-2 rounded-md font-semibold">
          {config?.logo ? <Image src={config.logo} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-contain" /> : <Scissors className="size-6 shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />}
          <span className="truncate">{primerNombre} <span className="text-[var(--page-primary-tinta)]">{restoNombre.join(" ")}</span></span>
        </Link>
        <NavegacionEscritorioHeader sesion={sesion} menuSesionAbierto={menuSesionAbierto} setMenuSesionAbierto={setMenuSesionAbierto} contenedorSesion={contenedorSesion} />
        <button ref={botonMovil} type="button" className="control-publico grid size-11 shrink-0 place-items-center rounded-md text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item)] hover:text-[var(--admin-texto-primario)] md:hidden" onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} aria-label={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuMovilAbierto} aria-controls={menuMovilAbierto ? "navegacion-movil" : undefined}>
          {menuMovilAbierto ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>
      {menuMovilAbierto && <MenuMovilHeader sesion={sesion} cerrarMenu={() => setMenuMovilAbierto(false)} />}
    </header>
  );
}
