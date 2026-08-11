"use client";

import { useState } from "react";
import AdminSidebar from "@/components/panel/navegacion/AdminSidebar";

const STORAGE_KEY = "admin-sidebar-collapsed";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-neutral-900 pt-16">
      <AdminSidebar collapsed={collapsed} onToggle={handleToggle} />

      <main className="flex-1 min-w-0 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}