"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Scissors, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MenuMovilHeader } from "@/components/inicio/MenuMovilHeader";
import { NavegacionEscritorioHeader } from "@/components/inicio/NavegacionEscritorioHeader";
import type { HeaderProps } from "@/components/inicio/header-tipos";

export function Header({ config }: HeaderProps) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuSesionAbierto, setMenuSesionAbierto] = useState(false);
  const contenedorSesion = useRef<HTMLDivElement>(null);
  const { data: sesion } = useSession();

  useEffect(() => {
    const cerrarAlHacerClickFuera = (evento: MouseEvent) => {
      if (contenedorSesion.current && !contenedorSesion.current.contains(evento.target as Node)) setMenuSesionAbierto(false);
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setMenuSesionAbierto(false);
    };
    document.addEventListener("mousedown", cerrarAlHacerClickFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("mousedown", cerrarAlHacerClickFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  const nombreNegocio = config?.name || "";
  const [primerNombre, ...restoNombre] = nombreNegocio.split(" ");

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 w-full border-b border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-texto-primario)]">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <Link href="/#home" className="flex items-center gap-2">
          {config?.logo ? <Image src={config.logo} alt={nombreNegocio} width={28} height={28} className="h-7 w-7 rounded-full object-contain" /> : <Scissors className="h-6 w-6 text-[var(--page-primary-tinta)]" />}
          <span>{` ${primerNombre} `}</span>
          <span className="text-[var(--page-primary-tinta)]">{restoNombre.join(" ")}</span>
        </Link>
        <NavegacionEscritorioHeader sesion={sesion} menuSesionAbierto={menuSesionAbierto} setMenuSesionAbierto={setMenuSesionAbierto} contenedorSesion={contenedorSesion} />
        <button type="button" className="p-2 text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)] md:hidden" onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} aria-label={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"}>
          {menuMovilAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {menuMovilAbierto && <MenuMovilHeader sesion={sesion} cerrarMenu={() => setMenuMovilAbierto(false)} />}
    </header>
  );
}
