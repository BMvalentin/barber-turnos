"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  Calendar, 
  ClipboardList,
  Clock,
  LogOut,
  Menu,
  X,
  CreditCard
} from "lucide-react";

import { CircleDollarSign } from "lucide-react"

const menuItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Barberos", href: "/barbero", icon: Users },
  { title: "Servicios", href: "/servicio", icon: Scissors },
  { title: "Turnos", href: "/turno", icon: Calendar },
  { title: "Días Laborales", href: "/diaLaboral", icon: Clock },
  { title: "Excepciones", href: "/excepcionesLaborales", icon: ClipboardList },
  { title: "Configuracion pago", href: "/admin/configuraciones", icon: CircleDollarSign },
  { title: "Mercado Pago", href: "/admin/mercadopago", icon: CreditCard },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón flotante para móvil */}
      <button 
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-amber-500 text-black p-3 rounded-full shadow-lg shadow-amber-500/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-16 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-60 bg-black/90 lg:bg-black/40 backdrop-blur-xl border-r border-amber-900/30 flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] pt-4 shadow-xl z-40 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>
      
      {/* Header */}
      <div className="p-4 border-b border-amber-900/30">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <p className="text-xs text-amber-200/60 mt-1">
          Gestión de barbería
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-semibold transition-all duration-200 group
                ${isActive
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner"
                  : "text-amber-200/70 hover:bg-amber-500/10 hover:text-amber-400"
                }
              `}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${isActive
                    ? "text-amber-400"
                    : "text-amber-200/70 group-hover:text-amber-400"
                  }`}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
    </>
  );
}