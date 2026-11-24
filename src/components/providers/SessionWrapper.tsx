"use client";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { limpiarCacheTurnosLocal } from "@/lib/admin/turnos-cache-local";
import { limpiarTurnosUsuarioCacheLocal } from "@/components/dashboard/turnos-usuario-cache-local";

export default function SessionWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  useEffect(() => {
    limpiarCacheTurnosLocal();
    if (!session?.user?.id) {
      limpiarTurnosUsuarioCacheLocal();
    }
  }, [session?.user?.id]);

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
