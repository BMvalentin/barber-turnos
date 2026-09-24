import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Scissors,
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
  tituloPorRol?: Partial<Record<RolPanel, string>>;
}

export interface GrupoDesplegable {
  titulo: string;
  icono: LucideIcon;
  items: ItemNavegacion[];
}

export type EntradaNavegacion = ItemNavegacion | GrupoDesplegable;

export interface GrupoNavegacion {
  titulo: string;
  tituloPorRol?: Partial<Record<RolPanel, string>>;
  items: EntradaNavegacion[];
}

export const GRUPOS_NAVEGACION: GrupoNavegacion[] = [
  {
    titulo: "Acceso",
    items: [{ titulo: "Ver sitio", href: "/", icono: Home, externo: true }],
  },
  {
    titulo: "Principal",
    tituloPorRol: { EMPLEADO: "Inicio" },
    items: [
      {
        titulo: "Dashboard",
        tituloPorRol: { EMPLEADO: "Mi resumen" },
        href: "/admin",
        icono: LayoutDashboard,
      },
      { titulo: "Servicios", href: "/admin/servicio", icono: Scissors, roles: ["ADMIN", "EMPLEADO"] },
    ],
  },
  {
    titulo: "Operación",
    tituloPorRol: { EMPLEADO: "Agenda" },
    items: [
      {
        titulo: "Turnos",
        tituloPorRol: { EMPLEADO: "Mis turnos" },
        href: "/admin/turno",
        icono: Calendar,
      },
    ],
  },
  {
    titulo: "Configuración",
    tituloPorRol: { EMPLEADO: "Mi espacio" },
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
          {
            titulo: "Mi perfil",
            tituloPorRol: { EMPLEADO: "Mis datos" },
            href: "/admin/barbero/perfil",
            icono: Users,
            roles: ["ADMIN", "EMPLEADO"],
          },
          { titulo: "Empleados", href: "/admin/barbero", icono: Users, roles: ["ADMIN"] },
          {
            titulo: "Horarios",
            tituloPorRol: { EMPLEADO: "Mis horarios" },
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
