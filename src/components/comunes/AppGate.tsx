"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/inicio/Footer";

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
}: AppGateProps) {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith("/admin");

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
