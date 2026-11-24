// app/admin/layout.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";
import AdminShell from "@/components/panel/navegacion/AdminShell";
import AvisoPerfilIncompletoAdmin from "@/components/barbero/AvisoPerfilIncompletoAdmin";
import { obtenerPendientesPerfilBarbero } from "@/lib/consultas/obtener-pendientes-perfil-barbero";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { cookies } from "next/headers";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, contexto, config, almacen] = await Promise.all([
    requerirSesion(),
    requerirPanel(),
    obtenerConfigCacheada(),
    cookies(),
  ]);

  if (!session?.user) {
    redirect("/login");
  }

  if (!contexto) {
    redirect("/dashboard");
  }

  const temaGuardado = almacen.get("mayoraz-admin-tema")?.value;
  const pendientes = contexto.barberoId
    ? await obtenerPendientesPerfilBarbero(contexto.barberoId, session.user.id)
    : [];

  return (
    <AdminShell
      config={config ? { name: config.name, logo: config.logo } : null}
      rol={contexto.rol}
      colapsadoInicial={almacen.get("mayoraz-sidebar-collapsed")?.value === "1"}
      temaInicial={temaGuardado === "claro" || temaGuardado === "oscuro" ? temaGuardado : "sistema"}
    >
      {children}
      {pendientes.length > 0 && (
        <AvisoPerfilIncompletoAdmin pendientes={pendientes} esEmpleado={contexto.rol === "EMPLEADO"} />
      )}
    </AdminShell>
  );
}
