"use client";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { limpiarCacheTurnosLocal } from "@/lib/admin/turnos-cache-local";

export default function SessionWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  useEffect(() => {
    if (!session?.user?.id) limpiarCacheTurnosLocal();
  }, [session?.user?.id]);

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
