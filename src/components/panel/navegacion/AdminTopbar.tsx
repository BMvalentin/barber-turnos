"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, LogOut, Menu, User } from "lucide-react";
import { GRUPOS_NAVEGACION } from "@/components/panel/navegacion/items-navegacion";
import { handleSignOut } from "@/actions/sesion/logout.actions";

interface AdminTopbarProps {
  menuAbierto: boolean;
  alAlternarMenu: () => void;
}

export default function AdminTopbar({
  menuAbierto,
  alAlternarMenu,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const itemActual = GRUPOS_NAVEGACION.flatMap((grupo) => grupo.items)
    .flatMap((entrada) => ("href" in entrada ? [entrada] : entrada.items))
    .find((item) => item.href === pathname);

  useEffect(() => {
    if (!menuUsuarioAbierto) return;

    const alPresionarFuera = (evento: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setMenuUsuarioAbierto(false);
      }
    };
    const alPresionarEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setMenuUsuarioAbierto(false);
    };

    document.addEventListener("mousedown", alPresionarFuera);
    document.addEventListener("keydown", alPresionarEscape);
    return () => {
      document.removeEventListener("mousedown", alPresionarFuera);
      document.removeEventListener("keydown", alPresionarEscape);
    };
  }, [menuUsuarioAbierto]);

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4"
      style={{
        borderColor: "var(--admin-border)",
        backgroundColor: "var(--admin-surface)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={alAlternarMenu}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuAbierto}
          className="-ml-1 rounded-md p-2 text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-border)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden truncate text-sm font-medium text-[var(--admin-texto-secundario)] lg:block">
          {itemActual?.titulo ?? "Panel"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/turno"
          className="hidden items-center gap-2 rounded-lg bg-[var(--page-primary)] px-3.5 py-2 text-sm font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] sm:inline-flex"
        >
          <Calendar className="h-4 w-4" />
          Turnos
        </Link>

        <div className="relative" ref={contenedorRef}>
          <button
            type="button"
            onClick={() => setMenuUsuarioAbierto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuUsuarioAbierto}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--admin-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
          >
            <Image
              src={session?.user?.image || "/images/avatar-default.svg"}
              alt="Avatar del usuario"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full"
            />
            <span className="hidden text-sm font-medium text-[var(--admin-texto-secundario)] md:inline">
              {session?.user?.name || "Usuario"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--admin-texto-muted)]" />
          </button>

          {menuUsuarioAbierto && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-1 shadow-xl">
              <Link
                href="/dashboard"
                onClick={() => setMenuUsuarioAbierto(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-border)] hover:text-[var(--admin-texto-primario)]"
              >
                <User className="h-4 w-4 shrink-0" />
                Mi perfil
              </Link>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
