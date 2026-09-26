// app/turno/layout.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

export default async function TurnoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requerirSesion();

  if (!session?.user) {
    redirect("/login");
  }

  if (await requerirPanel()) {
    redirect("/admin/turno");
  }

  return <>{children}</>;
}
