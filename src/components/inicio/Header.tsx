"use client";
import { useEffect, useRef, useState } from "react";
import { DoorOpen, Scissors, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/sesion/logout.actions";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { esAdmin } from "@/lib/seguridad/es-admin";

interface HeaderProps {
  config?: {
    name?: string | null;
    logo?: string | null;
  } | null;
}

export function Header({ config }: HeaderProps) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const contenedorSesion = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const cerrarAlHacerClickFuera = (evento: MouseEvent) => {
      if (
        contenedorSesion.current &&
        !contenedorSesion.current.contains(evento.target as Node)
      ) {
        setMenuAbierto(false);
      }
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", cerrarAlHacerClickFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("mousedown", cerrarAlHacerClickFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  const businessName = config?.name || "";
  const words = businessName.split(" ");
  const firstName = words[0];
  const lastName = words.slice(1).join(" ");

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-16 w-full text-[var(--page-bg-foreground)]"
      style={{
        backgroundColor: "var(--admin-surface)",
        borderBottom: "1px solid var(--admin-border)",
      }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/#home" className="flex items-center gap-2">
          {config?.logo ? (
            <Image
              src={config.logo}
              alt={businessName}
              width={28}
              height={28}
              className="w-7 h-7 object-contain rounded-full"
            />
          ) : (
            <Scissors
              className="w-6 h-6"
              style={{ color: "var(--page-primary-tinta)" }}
            />
          )}
          <span>{` ${firstName} `}</span>
          <span style={{ color: "var(--page-primary-tinta)" }}>{`${lastName}`}</span>
        </Link>

        {/* DESKTOP NAV & AUTH */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link
              href="/#servicios"
              className="text-sm font-medium text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors"
            >
              Servicios
            </Link>

            <Link
              href="/#ubicacion"
              className="text-sm font-medium text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors"
            >
              Ubicación
            </Link>

            {esAdmin(session) && (
              <Link
                href="/admin"
                className="text-sm font-medium text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors"
              >
                Administrador
              </Link>
            )}
          </nav>

          <Link
            href={session ? "/turno" : "/login"}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors bg-[var(--page-primary)] text-[var(--page-primary-foreground)] hover:bg-[var(--page-primary-hover)]"
          >
            Turnos
          </Link>

          {session ? (
            <div ref={contenedorSesion} className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--admin-border)]"
                onClick={() => setMenuAbierto(!menuAbierto)}
                aria-expanded={menuAbierto}
                aria-haspopup="menu"
              >
                <Image
                  src={session.user?.image || "/images/avatar-default.svg"}
                  alt=""
                  className="rounded-full"
                  width={28}
                  height={28}
                />
                <span className="hidden sm:inline text-sm font-medium text-[var(--page-bg-foreground)]">
                  {session.user?.name}
                </span>
                <ChevronDown className="h-4 w-4 text-[var(--page-bg-foreground)]/50" />
              </button>

              {menuAbierto && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] shadow-xl py-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuAbierto(false)}
                    className="block w-full px-3 py-2 text-sm text-[var(--page-bg-foreground)]/80 hover:bg-[var(--admin-border)] hover:text-[var(--page-bg-foreground)] rounded-md"
                  >
                    Mi perfil
                  </Link>
                  <form action={handleSignOut}>
                    <button
                      type="submit"
                      onClick={() => setMenuAbierto(false)}
                      className="block w-full px-3 py-2 text-sm text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--page-bg-foreground)]/80 hover:text-[var(--page-bg-foreground)] hover:bg-[var(--admin-border)] transition-colors"
            >
              <DoorOpen className="h-4 w-4" />
              Iniciar Sesión
            </Link>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          type="button"
          className="md:hidden p-2 text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors"
          onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          aria-label={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"}
        >
          {menuMovilAbierto ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuMovilAbierto && (
        <div
          className="md:hidden border-t"
          style={{
            borderColor: "var(--admin-border)",
            backgroundColor: "var(--admin-surface)",
          }}
        >
          <div className="flex flex-col px-6 py-6 space-y-4">
            <Link
              href="/#servicios"
              onClick={() => setMenuMovilAbierto(false)}
              className="py-2 text-base text-[var(--page-bg-foreground)]/80 hover:text-[var(--page-bg-foreground)] transition-colors"
            >
              Servicios
            </Link>
            <Link
              href="/#ubicacion"
              onClick={() => setMenuMovilAbierto(false)}
              className="py-2 text-base text-[var(--page-bg-foreground)]/80 hover:text-[var(--page-bg-foreground)] transition-colors"
            >
              Ubicación
            </Link>

            {esAdmin(session) && (
              <Link
                href="/admin"
                onClick={() => setMenuMovilAbierto(false)}
                className="py-2 text-base text-[var(--page-bg-foreground)]/80 hover:text-[var(--page-bg-foreground)] transition-colors"
              >
                Administrador
              </Link>
            )}

            <div className="pt-2">
              <Link
                href={session ? "/turno" : "/login"}
                onClick={() => setMenuMovilAbierto(false)}
                className="block w-full rounded-lg px-3.5 py-2 text-center text-sm font-semibold transition-colors bg-[var(--page-primary)] text-[var(--page-primary-foreground)] hover:bg-[var(--page-primary-hover)]"
              >
                Turnos
              </Link>
            </div>

            <div
              className="border-t pt-6 mt-4"
              style={{ borderColor: "var(--admin-border)" }}
            >
              {session ? (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuMovilAbierto(false)}
                    className="flex items-center gap-3 py-2"
                  >
                    <Image
                      src={session.user?.image || "/images/avatar-default.svg"}
                      alt=""
                      className="rounded-full"
                      width={40}
                      height={40}
                    />
                    <span className="text-base font-medium text-[var(--page-bg-foreground)]">
                      {session.user?.name}
                    </span>
                  </Link>
                  <form action={handleSignOut} className="w-full">
                    <button
                      type="submit"
                      onClick={() => setMenuMovilAbierto(false)}
                      className="w-full py-2 text-left text-base text-red-400 hover:text-red-300 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="flex items-center gap-2 py-2 text-base text-[var(--page-bg-foreground)]/80 hover:text-[var(--page-bg-foreground)] transition-colors"
                >
                  <DoorOpen className="h-4 w-4" />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
