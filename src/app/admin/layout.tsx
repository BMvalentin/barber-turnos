// app/admin/layout.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";
import AdminShell from "@/components/panel/navegacion/AdminShell";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requerirSesion();

  if (!session?.user) {
    redirect("/login");
  }

  const [sesionAdmin, config] = await Promise.all([
    requerirAdmin(),
    obtenerConfigCacheada(),
  ]);

  if (!sesionAdmin) {
    redirect("/dashboard");
  }

  return <AdminShell config={config}>{children}</AdminShell>;
}
