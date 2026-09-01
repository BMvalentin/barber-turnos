import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Scissors,
  ClipboardList,
  CreditCard,
  Calendar,
  Settings,
  Home,
  Building2,
  MapPin,
  Palette,
  Image as ImageIcon,
  Clock,
} from "lucide-react";

export interface ItemNavegacion {
  titulo: string;
  href: string;
  icono: LucideIcon;
  externo?: boolean;
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
      { titulo: "Servicios", href: "/admin/servicio", icono: Scissors },
    ],
  },
  {
    titulo: "Operación",
    items: [
      { titulo: "Excepciones", href: "/admin/excepcionesLaborales", icono: ClipboardList },
      { titulo: "Mercado Pago", href: "/admin/mercadopago", icono: CreditCard },
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
          { titulo: "Información general", href: "/admin/config", icono: Building2 },
          {
            titulo: "Ubicación y contacto",
            href: "/admin/config/ubicacion-contacto",
            icono: MapPin,
          },
          { titulo: "Apariencia", href: "/admin/config/apariencia", icono: Palette },
          { titulo: "Imágenes", href: "/admin/config/imagenes", icono: ImageIcon },
          { titulo: "Empleados", href: "/admin/barbero", icono: Users },
          {
            titulo: "Horarios",
            href: "/admin/config/empleados/horarios-laborales",
            icono: Clock,
          },
        ],
      },
    ],
  },
];
