"use client";
import { Header } from "@/components/inicio/Header";
import SessionWrapper from "@/components/providers/SessionWrapper";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { esAdmin } from "@/lib/seguridad/es-admin";

type ConfiguracionHeader = {
  name?: string | null;
  logo?: string | null;
};

export default function LayoutComponent({
  children,
  session,
  config,
}: {
  children: React.ReactNode;
  session: Session | null;
  config?: ConfiguracionHeader | null;
}) {
  const pathname = usePathname();
  const ocultarHeader =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/turno") && esAdmin(session));

  return (
    <SessionWrapper>
      {!ocultarHeader && <Header config={config} />}
      {children}
    </SessionWrapper>
  );
}