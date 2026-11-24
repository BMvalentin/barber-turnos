import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const leerConfiguracion = unstable_cache(
  async () => prisma.pageConfig.findUnique({ where: { id: 1 } }),
  ["page-config-v2"],
  { tags: ["page-config"], revalidate: 3600 },
);

/** Comparte la lectura entre metadata, layouts y páginas de una misma solicitud. */
export const obtenerConfigCacheada = cache(async () => {
  try {
    return await leerConfiguracion();
  } catch {
    console.error("No se pudo leer la configuración de la página.");
    return null;
  }
});
