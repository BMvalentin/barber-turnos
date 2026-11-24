// components/admin/config/modulos-config.ts
import type { DatosConfiguracion } from "@/types/page-config";

export type IdModuloConfig =
  | "informacion-general"
  | "ubicacion-contacto"
  | "ajustes-pago"
  | "medios-pago"
  | "apariencia"
  | "imagenes";

export interface ModuloConfig {
  id: IdModuloConfig;
  etiqueta: string;
  descripcion: string;
}

export const MODULOS_CONFIG: ModuloConfig[] = [
  { id: "informacion-general", etiqueta: "Información general", descripcion: "Editá cómo se presenta tu barbería en el sitio de reservas." },
  { id: "ubicacion-contacto", etiqueta: "Ubicación y contacto", descripcion: "Indicá dónde queda tu barbería y cómo pueden contactarte tus clientes." },
  { id: "ajustes-pago", etiqueta: "Ajustes de pago", descripcion: "Configurá los avisos relacionados con las señas." },
  { id: "medios-pago", etiqueta: "Configuración de pagos", descripcion: "Administrá los medios de pago que ofrecés a tus clientes." },
  { id: "apariencia", etiqueta: "Apariencia", descripcion: "Personalizá los colores del sitio público de tu barbería." },
  { id: "imagenes", etiqueta: "Imágenes", descripcion: "Actualizá el logo, el icono del navegador y la imagen de portada." },
];

export const CAMPOS_POR_MODULO: Record<IdModuloConfig, Array<keyof DatosConfiguracion>> = {
  "informacion-general": ["name", "slogan", "description"],
  "ubicacion-contacto": ["whatsapp", "mapsUrl", "address"],
  "ajustes-pago": ["mostrarAvisoSeniaPendiente"],
  "medios-pago": [
    "transferenciaTitular",
    "transferenciaCuit",
    "transferenciaAlias",
    "transferenciaCbu",
    "transferenciaBanco",
    "transferenciaActiva",
  ],
  apariencia: ["primaryColor", "secondaryColor", "bgColor"],
  imagenes: ["logo", "favicon", "backgroundImage"],
};
