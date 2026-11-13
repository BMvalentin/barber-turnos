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
}

export const MODULOS_CONFIG: ModuloConfig[] = [
  { id: "informacion-general", etiqueta: "Información general" },
  { id: "ubicacion-contacto", etiqueta: "Ubicación y contacto" },
  { id: "ajustes-pago", etiqueta: "Ajustes de pago" },
  { id: "medios-pago", etiqueta: "Configuración de pagos" },
  { id: "apariencia", etiqueta: "Apariencia" },
  { id: "imagenes", etiqueta: "Imágenes" },
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
