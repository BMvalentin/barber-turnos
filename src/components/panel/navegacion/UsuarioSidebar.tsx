"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import useSugerenciaLateral from "@/components/panel/navegacion/useSugerenciaLateral";
import type { RolPanel } from "@/types/usuario";

interface UsuarioSidebarProps { colapsado: boolean; alCerrar: () => void; rol: RolPanel; }

export default function UsuarioSidebar({ colapsado, alCerrar, rol }: UsuarioSidebarProps) {
  const { data: sesion } = useSession();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const nombre = sesion?.user?.name || "Usuario";
  const identificadorDesplegable = useId();
  const { mostrar, ocultar, sugerencia } = useSugerenciaLateral(botonRef, nombre, colapsado);

  const cerrarSesion = () => {
    setAbierto(false);
    alCerrar();
    void signOut({ redirectTo: "/" });
  };

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: MouseEvent) => {
      if (evento.target instanceof Node && !contenedorRef.current?.contains(evento.target)) setAbierto(false);
    };
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", alPresionar);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alPresionar);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto]);

  return (
    <div ref={contenedorRef} className="relative shrink-0 border-t border-[var(--admin-border)] p-2.5">
      <div id={identificadorDesplegable} aria-hidden={!abierto} inert={!abierto} className={`absolute bottom-full z-20 mb-2 origin-bottom rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-1 shadow-xl transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${abierto ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"} ${colapsado ? "left-2 right-2 admin-escritorio:bottom-0 admin-escritorio:left-full admin-escritorio:right-auto admin-escritorio:mb-0 admin-escritorio:ml-2 admin-escritorio:w-56 admin-escritorio:origin-left" : "left-2 right-2"}`}>
        <Link href="/dashboard" onClick={() => { setAbierto(false); alCerrar(); }} className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)]">
          <User className="size-4" aria-hidden="true" /> Mi cuenta
          </Link>
        <button type="button" onClick={cerrarSesion} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--admin-error)] transition-colors hover:bg-[var(--admin-error-suave)]">
            <LogOut className="size-4" aria-hidden="true" /> Cerrar sesión
        </button>
      </div>
      <button ref={botonRef} type="button" onClick={() => setAbierto((valor) => !valor)} onMouseEnter={mostrar} onMouseLeave={ocultar} onFocus={mostrar} onBlur={ocultar} aria-label={`Opciones de ${nombre}`} aria-expanded={abierto} aria-controls={identificadorDesplegable} className={`flex w-full items-center rounded-lg py-2 transition-[background-color,transform] duration-200 ease-out motion-reduce:transition-none hover:-translate-y-px hover:bg-[var(--admin-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] ${colapsado ? "gap-3 px-2 admin-escritorio:justify-center admin-escritorio:px-0 admin-escritorio:hover:scale-105" : "gap-3 px-2"}`}>
        <Image src={sesion?.user?.image || "/images/avatar-default.svg"} alt="Avatar del usuario" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover" />
        <span className={`min-w-0 flex-1 text-left ${colapsado ? "admin-escritorio:hidden" : ""}`}>
          <span className="block truncate text-sm font-medium text-[var(--admin-texto-primario)]">{nombre}</span>
          <span className="block text-xs text-[var(--admin-texto-muted)]">{rol === "ADMIN" ? "Administrador" : "Empleado"}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--admin-texto-muted)] transition-transform duration-200 ease-out motion-reduce:transition-none ${abierto ? "rotate-180" : ""} ${colapsado ? "admin-escritorio:hidden" : ""}`} />
      </button>
      {sugerencia}
    </div>
  );
}
