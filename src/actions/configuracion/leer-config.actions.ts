"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export async function getPageConfig() {
  return unstable_cache(
    async () => {
      try {
        const config = await prisma.pageConfig.findFirst() || await prisma.pageConfig.findUnique({
          where: { id: 1 },
        });

        return config;
      } catch (error) {
        console.error("Error al obtener la configuración de la página:", error);
        return null;
      }
    },
    ["page-config"],
    { tags: ["page-config"], revalidate: 300 }
  )();
}
