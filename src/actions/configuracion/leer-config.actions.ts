"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const obtenerConfiguracionCacheada = unstable_cache(
  async () => {
    try {
      return await prisma.pageConfig.findUnique({ where: { id: 1 } });
    } catch (error) {
      console.error("Error al obtener la configuración de la página:", error);
      return null;
    }
  },
  ["page-config"],
  { tags: ["page-config"], revalidate: 300 },
);

export async function getPageConfig() {
  return obtenerConfiguracionCacheada();
}
