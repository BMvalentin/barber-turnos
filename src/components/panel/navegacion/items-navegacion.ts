import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Scissors,
  Clock,
  ClipboardList,
  CreditCard,
  Calendar,
  Settings,
  Home,
} from "lucide-react";

export interface ItemNavegacion {
  titulo: string;
  href: string;
  icono: LucideIcon;
  externo?: boolean;
}

export interface GrupoNavegacion {
  titulo: string;
  items: ItemNavegacion[];
}

export const GRUPOS_NAVEGACION: GrupoNavegacion[] = [
  {
    titulo: "Acceso",
    items: [{ titulo: "Ver sitio", href: "/", icono: Home, externo: true }],
  },
  {
    titulo: "Principal",
    items: [
      { titulo: "Dashboard", href: "/admin", icono: LayoutDashboard },
      { titulo: "Barberos", href: "/admin/barbero", icono: Users },
      { titulo: "Servicios", href: "/admin/servicio", icono: Scissors },
    ],
  },
  {
    titulo: "Operación",
    items: [
      { titulo: "Días Laborales", href: "/admin/diaLaboral", icono: Clock },
      { titulo: "Excepciones", href: "/admin/excepcionesLaborales", icono: ClipboardList },
      { titulo: "Mercado Pago", href: "/admin/mercadopago", icono: CreditCard },
      { titulo: "Turnos", href: "/admin/turno", icono: Calendar },
    ],
  },
  {
    titulo: "Configuración",
    items: [
      { titulo: "Configuración", href: "/admin/config", icono: Settings },
    ],
  },
];
