import type { ResponsableLegal } from "@/lib/legal/tipos";

/* Shape mínima de la configuración del sitio necesaria para la cabecera legal.
   Coincide con los campos de `PageConfig` usados en las páginas públicas. */
export type ConfiguracionResponsable = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
};

function limpiar(valor: string | null | undefined): string | null {
  const texto = valor?.trim();
  return texto ? texto : null;
}

export function responsableDesdeConfig(
  config: ConfiguracionResponsable | null,
): ResponsableLegal {
  return {
    nombre: limpiar(config?.name),
    email: limpiar(config?.email),
    telefono: limpiar(config?.phone),
    direccion: limpiar(config?.address),
    ciudad: limpiar(config?.city),
    provincia: limpiar(config?.province),
    pais: limpiar(config?.country),
  };
}
