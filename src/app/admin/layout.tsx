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
    <div className="flex min-h-screen bg-gradient-to-br from-black to-amber-950/30">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Contenido */}
      <main className="flex-1 ml-60 p-6 sm:p-8 pt-24 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}