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
  Menu,
  X,
  CreditCard,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react";

const userMenuItems = [
  { title: "Turnos", href: "/turno", icon: Calendar },
];
const adminMenuItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Barberos", href: "/admin/barbero", icon: Users },
  { title: "Servicios", href: "/admin/servicio", icon: Scissors },
  { title: "Días Laborales", href: "/admin/diaLaboral", icon: Clock },
  { title: "Excepciones", href: "/admin/excepcionesLaborales", icon: ClipboardList },
  { title: "Mercado Pago", href: "/admin/mercadopago", icon: CreditCard },
  { title: "Configuración", href: "/admin/config", icon: Settings },
];

function SidebarItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: { title: string; href: string; icon: LucideIcon };
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.title : undefined}
      className={`
        flex items-center gap-3 rounded-lg text-sm font-semibold transition-colors duration-200 group overflow-hidden whitespace-nowrap py-2.5
        ${collapsed ? "justify-center px-0" : "px-3"}
        ${isActive
          ? "bg-[var(--page-primary)]/20 text-[var(--page-primary-tinta)] border border-[var(--page-primary)]/30 shadow-inner"
          : "text-white hover:bg-[var(--page-primary)]/10 hover:text-[var(--page-primary-tinta)]"}
      `}
    >
      <Icon
        className={`h-5 w-5 shrink-0 transition-colors ${
          isActive
            ? "text-[var(--page-primary-tinta)]"
            : "text-white group-hover:text-[var(--page-primary-tinta)]"
        }`}
      />
      <span
        className={`transition-opacity duration-300 ${
          collapsed ? "hidden" : "opacity-100"
        }`}
      >
        {item.title}
      </span>
    </Link>
  );
}

export default function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón flotante para móvil */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-[var(--page-primary)] text-[var(--page-primary-foreground)] p-3 rounded-full shadow-lg shadow-[var(--page-primary)]/20"
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
      <aside
        className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] pt-4 shadow-xl z-40 transition-all duration-300
        bg-black/90 lg:bg-black/60 backdrop-blur-xl border-r border-amber-900/30 flex flex-col shrink-0
        w-60 ${collapsed ? "lg:w-16" : "lg:w-60"}
        lg:sticky lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Botón colapsar/expandir (solo desktop) */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expandir panel" : "Colapsar panel"}
          title={collapsed ? "Expandir panel" : "Colapsar panel"}
          className="hidden lg:flex absolute -right-3 top-4 z-10 h-6 w-6 items-center justify-center rounded-full border border-amber-900/40 bg-black/80 text-white shadow-lg shadow-black/40 backdrop-blur transition-colors duration-200 hover:border-[var(--page-primary)]/60 hover:text-[var(--page-primary-tinta)]"
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
        {/* Header */}
        <div className="relative p-4 overflow-hidden">
          <Scissors
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[var(--page-primary-tinta)] transition-opacity duration-300 ${
              collapsed ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`transition-opacity duration-300 ${
              collapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            <h1 className="text-xl font-bold text-white whitespace-nowrap">
              Admin Panel
            </h1>
            <p className="text-xs text-white mt-1 whitespace-nowrap">
              Gestión de barbería
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          <div className="border-t border-amber-900/30 my-2" />
          {adminMenuItems.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={() => setIsOpen(false)}
            />
          ))}
          <div className="border-t border-amber-900/30 my-2" />
          {userMenuItems.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}