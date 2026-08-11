// app/dashboard/layout.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requerirSesion();

  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
