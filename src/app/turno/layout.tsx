// app/turno/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/panel/navegacion/AdminShell";

export default async function TurnoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}