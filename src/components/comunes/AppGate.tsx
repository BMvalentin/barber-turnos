"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Footer } from "@/components/inicio/Footer";
import { esAdmin as esUsuarioAdmin } from "@/lib/seguridad/es-admin";

type AppGateProps = {
  children: React.ReactNode;
  barberiaNombre?: string | null;
  logoUrl?: string | null;
  descripcion?: string | null;
  localidad?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  isAdmin?: boolean;
};

export default function AppGate({
  children,
  barberiaNombre,
  logoUrl,
  descripcion,
  localidad,
  instagram,
  whatsapp,
  telefono,
  email,
  direccion,
  ciudad,
  isAdmin = false
}: AppGateProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const esAdmin = esUsuarioAdmin(session) || isAdmin;

  const hideFooter =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/turno") && esAdmin);

  return (
    <>
      {children}

      {!hideFooter && (
        <Footer
          barberiaNombre={barberiaNombre}
          logoUrl={logoUrl}
          descripcion={descripcion}
          localidad={localidad}
          instagram={instagram}
          whatsapp={whatsapp}
          telefono={telefono}
          email={email}
          direccion={direccion}
          ciudad={ciudad}
        />
      )}
    </>
  );
}
