/* Shape único de `page_config` (modelo Prisma `PageConfig`).
   Agrupa los tres usos previos: `PageConfigData` (config-general.actions),
   `DatosConfiguracion` (formulario de admin/config) y el inline de
   `GeneralConfigForm`. */

/* Datos del formulario de configuración general (todos los campos requeridos). */
export type DatosConfiguracion = {
  name: string;
  description: string;
  slogan: string;
  logo: string;
  favicon: string;
  backgroundImage: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  whatsapp: string;
  mapsUrl: string;
  address: string;
};

/* Payload parcial para la server action de actualización (config-general.actions). */
export type PageConfigData = Partial<DatosConfiguracion>;

/* Datos iniciales del formulario (pueden venir con null desde Prisma). */
export type DatosConfiguracionInicial = Partial<
  Record<keyof DatosConfiguracion, string | null>
>;
