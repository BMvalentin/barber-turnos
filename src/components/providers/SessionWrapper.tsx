"use client";
import { useEffect, useRef } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { limpiarCacheServiciosLocal } from "@/lib/admin/servicios-cache-local";
import { limpiarCacheTurnosLocal } from "@/lib/admin/turnos-cache-local";
import { limpiarTurnosUsuarioCacheLocal } from "@/components/dashboard/turnos-usuario-cache-local";

export default function SessionWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const usuarioAnterior = useRef(session?.user?.id);

  useEffect(() => {
    if (!session?.user?.id || usuarioAnterior.current !== session.user.id) {
      limpiarCacheServiciosLocal();
    }
    usuarioAnterior.current = session?.user?.id;
    if (!session?.user?.id) {
      limpiarCacheTurnosLocal();
      limpiarTurnosUsuarioCacheLocal();
    }
  }, [session?.user?.id]);

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
