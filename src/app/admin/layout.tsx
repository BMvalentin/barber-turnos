// app/admin/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-gray-950"> {/* ← CAMBIO AQUÍ: bg-gray-950 */}
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8 pt-24">
        {children}
      </main>
    </div>
  );
}