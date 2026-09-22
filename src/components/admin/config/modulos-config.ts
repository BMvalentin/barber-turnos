// components/admin/config/modulos-config.ts
import type { DatosConfiguracion } from "@/types/page-config";

export type IdModuloConfig =
  | "informacion-general"
  | "ubicacion-contacto"
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
  { id: "medios-pago", etiqueta: "Medios de pago" },
  { id: "apariencia", etiqueta: "Apariencia" },
  { id: "imagenes", etiqueta: "Imágenes" },
];

export const CAMPOS_POR_MODULO: Record<IdModuloConfig, Array<keyof DatosConfiguracion>> = {
  "informacion-general": ["name", "slogan", "description"],
  "ubicacion-contacto": ["whatsapp", "mapsUrl", "address"],
  "medios-pago": [
    "transferenciaTitular",
    "transferenciaCuit",
    "transferenciaAlias",
    "transferenciaCbu",
    "transferenciaBanco",
  ],
  apariencia: ["primaryColor", "secondaryColor", "bgColor"],
  imagenes: ["logo", "favicon", "backgroundImage"],
};
