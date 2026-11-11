import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPageConfig } from "@/actions/configuracion/leer-config.actions";
import { prisma } from "@/lib/prisma";

/** Configuración de página memoizada por request (compartida por metadata y layout). */
export const obtenerConfigCacheada = cache(async () => await getPageConfig());

const obtenerMarcaAdminCacheadaInterna = unstable_cache(
  async () => prisma.pageConfig.findUnique({
    where: { id: 1 },
    select: { name: true, logo: true },
  }),
  ["page-config-admin-marca"],
  { tags: ["page-config"], revalidate: 300 },
);

/** Proyección mínima para el shell del panel; excluye datos de contacto y pago. */
export const obtenerMarcaAdminCacheada = cache(async () => obtenerMarcaAdminCacheadaInterna());
