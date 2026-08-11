"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { DoorOpen, Scissors, Menu, X } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/sesion/auth-actions";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface HeaderProps {
  config?: {
    name?: string | null;
    logo?: string | null;
  } | null;
}

export function Header({ config }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const businessName = config?.name || "";
  const words = businessName.split(" ");
  const firstName = words[0];
  const lastName = words.slice(1).join(" ");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl shadow-md w-full shadow-black text-white"
      style={{
        background: `linear-gradient(to bottom right, var(--page-secondary-80), #000000cc)`,
      }}
    >
      <div className="container flex items-center justify-between h-16 mx-auto px-4 select-none">
        <Link href="/#home" className="flex items-center gap-2 relative z-50">
          {config?.logo ? (
            <Image 
              src={config.logo} 
              alt={businessName} 
              width={28} 
              height={28} 
              className="w-7 h-7 object-contain rounded-full" 
            />
          ) : (
            <Scissors className="w-6 h-6" style={{ color: "var(--page-primary-tinta)" }} />
          )}
          <span>{` ${firstName} `}</span>
          <span style={{ color: "var(--page-primary-tinta)" }}>{`${lastName}`}</span>
        </Link>

        {/* DESKTOP NAV & AUTH */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8">
            <Link href="/#servicios" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="link" size="sm">Servicios</Button>
            </Link>

            <Link href="/#ubicacion" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="link" size="sm">Ubicación</Button>
            </Link>

            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Button variant="link" size="sm">Administrador</Button>
              </Link>
            )}

            <Link href={session ? "/turno" : "/login"} className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Button 
                size="sm"
                style={{ backgroundColor: "var(--page-primary)", color: "var(--page-primary-foreground)" }}
              >
                Turnos
              </Button>
            </Link>
          </nav>

          {session ? (
            <div className="flex items-center gap-4 border-l pl-6" style={{ borderColor: "var(--page-primary-40)" }}>
              <span className="text-sm">
                <Link className="flex flex-row items-center" href="/dashboard">
                  <Image src={session.user?.image || "/images/avatar-default.svg"} alt="" className="rounded-full" width={32} height={32} />
                  <Button variant="link" size="sm">{session.user?.name}</Button>
                </Link>
              </span>
              <form action={handleSignOut}>
                <Button variant="rojo" size="sm" type="submit">Salir</Button>
              </form>
            </div>
          ) : (
            <div className="border-l pl-6" style={{ borderColor: "var(--page-primary-40)" }}>
              <Link href="/login">
                <Button 
                  size="sm"
                  style={{ backgroundColor: "var(--page-primary)", color: "var(--page-primary-foreground)" }}
                >
                  <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden relative z-50 p-2"
          style={{ color: "var(--page-primary-tinta)" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-black/95 backdrop-blur-xl overflow-hidden"
            style={{ borderColor: "var(--page-primary-30)" }}
          >
            <div className="flex flex-col px-6 py-6 space-y-4">
              <Link href="/#servicios" onClick={() => setIsOpen(false)} className="text-base text-gray-300 hover:text-white transition-colors py-2">
                Servicios
              </Link>
              <Link href="/#ubicacion" onClick={() => setIsOpen(false)} className="text-base text-gray-300 hover:text-white transition-colors py-2">
                Ubicación
              </Link>

              {session?.user?.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="text-base font-medium transition-colors py-2" style={{ color: "var(--page-primary-tinta)" }}>
                  Administrador
                </Link>
              )}

              <div className="pt-2">
                <Link href={session ? "/turno" : "/login"} onClick={() => setIsOpen(false)}>
                  <Button variant="amarillo" className="w-full" style={{ backgroundColor: "var(--page-primary)", color: "var(--page-primary-foreground)" }}>Turnos</Button>
                </Link>
              </div>

              <div className="border-t pt-6 mt-4" style={{ borderColor: "var(--page-primary-30)" }}>
                {session ? (
                  <div className="flex flex-col gap-4">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 py-2">
                      <Image src={session.user?.image || "/images/avatar-default.svg"} alt="" className="rounded-full border" style={{ borderColor: "var(--page-primary-80)" }} width={40} height={40} />
                      <span className="text-base font-medium text-white">{session.user?.name}</span>
                    </Link>
                    <form action={handleSignOut} className="w-full">
                      <Button variant="rojo" className="w-full" type="submit" onClick={() => setIsOpen(false)}>Cerrar Sesión</Button>
                    </form>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full bg-transparent" style={{ borderColor: "var(--page-primary)", color: "var(--page-primary-tinta)" }}>
                      <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}