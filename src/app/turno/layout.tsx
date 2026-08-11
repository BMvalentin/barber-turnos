// app/turno/layout.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { redirect } from "next/navigation";
import AdminShell from "@/components/panel/navegacion/AdminShell";

export default async function TurnoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requerirSesion();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}