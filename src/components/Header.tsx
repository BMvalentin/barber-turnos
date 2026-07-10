"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { DoorOpen, Scissors, Menu, X } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/auth-actions";
import Image from "next/image";

interface HeaderProps {
  session: any;
}

export function Header({ session }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-linear-to-br from-black to-amber-950/30
                shadow-md w-full drop-shadow-2xl text-white"
    >
      <div className="container flex items-center justify-between h-16 mx-auto px-4 select-none">
        <Link href="/#home" className="flex items-center gap-2 relative z-50">
          <Scissors className="w-6 h-6 text-amber-500" /><span>{' MAYORAZ '}</span><span className="text-amber-500">{'BARBER'}</span>
        </Link>
        
        {/* DESKTOP NAV & AUTH */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8">
            <Link href="/#servicios" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="link" size="sm">
                Servicios
              </Button>
            </Link>

            <Link href="/#nosotros" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="link" size="sm">
                Nosotros
              </Button>
            </Link>

            <Link href="/#ubicacion" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="link" size="sm">
                Ubicación
              </Button>
            </Link>

            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Button variant="link" size="sm">
                  Administrador
                </Button>
              </Link>
            )}

            <Link href={session ? "/turno" : "/login"} className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="amarillo" size="sm">
                  Turnos
              </Button>
            </Link>
          </nav>

          {session ? (
            <div className="flex items-center gap-4 border-l border-amber-900/50 pl-6">
              <span className="text-sm"><Link className="flex flex-row items-center" href="/dashboard"><Image src={session.user?.image || "/images/avatar-default.svg"} alt="" className="rounded-full" width={32} height={32}/><Button variant="link" size="sm">{session.user?.name}</Button></Link></span>
              <form action={handleSignOut}>
                <Button variant="rojo" size="sm" type="submit">Salir</Button>
              </form>
            </div>
          ) : (
            <div className="border-l border-amber-900/50 pl-6">
              <Link href="/login">
                <Button variant="amarillo" size="sm">
                  <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className="md:hidden relative z-50 text-amber-500 p-2"
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
            className="md:hidden border-t border-amber-900/30 bg-black/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col px-6 py-6 space-y-4">
              <Link href="/#servicios" onClick={() => setIsOpen(false)} className="text-base text-gray-300 hover:text-white transition-colors py-2">
                Servicios
              </Link>
              <Link href="/#nosotros" onClick={() => setIsOpen(false)} className="text-base text-gray-300 hover:text-white transition-colors py-2">
                Nosotros
              </Link>
              <Link href="/#ubicacion" onClick={() => setIsOpen(false)} className="text-base text-gray-300 hover:text-white transition-colors py-2">
                Ubicación
              </Link>
              
              {session?.user?.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="text-base text-amber-500 hover:text-amber-400 font-medium transition-colors py-2">
                  Administrador
                </Link>
              )}

              <div className="pt-2">
                <Link href={session ? "/turno" : "/login"} onClick={() => setIsOpen(false)}>
                  <Button variant="amarillo" className="w-full">Turnos</Button>
                </Link>
              </div>

              <div className="border-t border-amber-900/30 pt-6 mt-4">
                {session ? (
                  <div className="flex flex-col gap-4">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 py-2">
                      <Image src={session.user?.image || "/images/avatar-default.svg"} alt="" className="rounded-full border border-amber-500/50" width={40} height={40}/>
                      <span className="text-base font-medium text-white">{session.user?.name}</span>
                    </Link>
                    <form action={handleSignOut} className="w-full">
                      <Button variant="rojo" className="w-full" type="submit" onClick={() => setIsOpen(false)}>Cerrar Sesión</Button>
                    </form>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full bg-transparent border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black">
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
