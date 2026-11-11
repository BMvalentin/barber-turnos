// app/admin/layout.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";
import AdminShell from "@/components/panel/navegacion/AdminShell";
import { obtenerMarcaAdminCacheada } from "@/lib/obtener-config-cacheada";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, contexto, config, almacen] = await Promise.all([
    requerirSesion(),
    requerirPanel(),
    obtenerMarcaAdminCacheada(),
    cookies(),
  ]);

  if (!session?.user) {
    redirect("/login");
  }

  if (!contexto) {
    redirect("/dashboard");
  }

  return (
    <AdminShell
      config={config}
      rol={contexto.rol}
      colapsadoInicial={almacen.get("mayoraz-sidebar-collapsed")?.value === "1"}
    >
      {children}
    </AdminShell>
  );
}
