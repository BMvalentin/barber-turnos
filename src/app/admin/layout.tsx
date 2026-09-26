// app/admin/layout.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";
import AdminShell from "@/components/panel/navegacion/AdminShell";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, contexto, config] = await Promise.all([
    requerirSesion(),
    requerirPanel(),
    obtenerConfigCacheada(),
  ]);

  if (!session?.user) {
    redirect("/login");
  }

  if (!contexto) {
    redirect("/dashboard");
  }

  return <AdminShell config={config} rol={contexto.rol}>{children}</AdminShell>;
}
