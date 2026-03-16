// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  Calendar, 
  ClipboardList,
  Clock,
  LogOut
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Barberos",
    href: "/barbero",
    icon: Users,
  },
  {
    title: "Servicios",
    href: "/servicio",
    icon: Scissors,
  },
  {
    title: "Turnos",
    href: "/turno",
    icon: Calendar,
  },
  {
    title: "Días Laborales",
    href: "/diaLaboral",
    icon: Clock,
  },
  {
    title: "Excepciones",
    href: "/excepcionesLaborales",
    icon: ClipboardList,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col fixed left-0 top-0 h-screen pt-20 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <p className="text-xs text-gray-400 mt-1">Gestión de barbería</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-full
                font-semibold text-sm transition-all ease-linear
                group
                ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-inner"
                    : "text-gray-300 hover:bg-orange-500/10 hover:shadow-inner"
                }
              `}
            >
              <Icon 
                className={`h-5 w-5 ${
                  isActive 
                    ? "stroke-white" 
                    : "stroke-gray-300 group-hover:stroke-orange-500"
                }`} 
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-full text-red-400 hover:bg-red-500/10 hover:shadow-inner transition-all font-semibold text-sm group"
        >
          <LogOut className="h-5 w-5 stroke-red-400 group-hover:stroke-red-500" />
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </aside>
  );
}