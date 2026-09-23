import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Scissors,
  CreditCard,
  Landmark,
  Calendar,
  Settings,
  Home,
  Building2,
  MapPin,
  Palette,
  Image as ImageIcon,
  Clock,
} from "lucide-react";
import type { RolPanel } from "@/types/usuario";

export interface ItemNavegacion {
  titulo: string;
  href: string;
  icono: LucideIcon;
  externo?: boolean;
  roles?: readonly RolPanel[];
}

export interface GrupoDesplegable {
  titulo: string;
  icono: LucideIcon;
  items: ItemNavegacion[];
}

export type EntradaNavegacion = ItemNavegacion | GrupoDesplegable;

export interface GrupoNavegacion {
  titulo: string;
  items: EntradaNavegacion[];
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
      { titulo: "Servicios", href: "/admin/servicio", icono: Scissors, roles: ["ADMIN"] },
    ],
  },
  {
    titulo: "Operación",
    items: [
      { titulo: "Mercado Pago", href: "/admin/mercadopago", icono: CreditCard, roles: ["ADMIN"] },
      { titulo: "Turnos", href: "/admin/turno", icono: Calendar },
    ],
  },
  {
    titulo: "Configuración",
    items: [
      {
        titulo: "Configuración",
        icono: Settings,
        items: [
          { titulo: "Información general", href: "/admin/config", icono: Building2, roles: ["ADMIN"] },
          {
            titulo: "Ubicación y contacto",
            href: "/admin/config/ubicacion-contacto",
            icono: MapPin,
            roles: ["ADMIN"],
          },
          { titulo: "Medios de pago", href: "/admin/config/medios-pago", icono: Landmark, roles: ["ADMIN"] },
          { titulo: "Apariencia", href: "/admin/config/apariencia", icono: Palette, roles: ["ADMIN"] },
          { titulo: "Imágenes", href: "/admin/config/imagenes", icono: ImageIcon, roles: ["ADMIN"] },
          { titulo: "Empleados", href: "/admin/barbero", icono: Users, roles: ["ADMIN", "EMPLEADO"] },
          {
            titulo: "Horarios",
            href: "/admin/config/empleados/horarios-laborales",
            icono: Clock,
            roles: ["ADMIN", "EMPLEADO"],
          },
          {
            titulo: "Feriados y excepciones",
            href: "/admin/config/empleados/horarios-laborales/excepciones",
            icono: Calendar,
            roles: ["ADMIN"],
          },
          { titulo: "Usuarios", href: "/admin/usuarios", icono: Users, roles: ["ADMIN"] },
        ],
      },
    ],
  },
];
