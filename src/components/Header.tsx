"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DoorOpen } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/auth-actions";
import Image from "next/image";

interface HeaderProps {
  session: any;
}

export function Header({ session }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-linear-to-br from-white to-white/60
                shadow-md w-full"
    >
      <div className="container flex items-center justify-between h-16 mx-auto px-4 select-none">
        <Link href="/#home" className="flex items-center gap-2">
          <Image src="/images/logopng.png" alt="" width={'64'} height={'64'}/>
          <span className="hidden md:block text-xl font-semibold text-foreground">
            Chapa{" "}<span className="text-primary">Detail</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#servicios" className=" cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Button variant="link" size="sm">
              Servicios
            </Button>
          </Link>

          <Link href="/#nosotros" className=" cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Button variant="link" size="sm">
              Nosotros
            </Button>
          </Link>

          <Link href="/#ubicacion" className=" cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Button variant="link" size="sm">
              Ubicación
            </Button>
          </Link>

          <Link href={session ? "/turno" : "/login"} className=" cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Button variant="celeste" size="sm">
                Turnos
            </Button>
          </Link>
        </nav>

        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm"><Link className="flex flex-row items-center" href="/dashboard"><Image src={session.user?.image || "/images/avatar-default.svg"} alt="" className="rounded-full" width={'32'} height={'32'}/><Button variant="link" size="sm">{session.user?.name}</Button></Link></span>
            <form action={handleSignOut}>
              <Button variant="rojo" size="sm" type="submit">Salir</Button>
            </form>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="amarillo" size="sm">
              <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
            </Button>
          </Link>
        )}
      </div>
    </motion.header>
  );
}
