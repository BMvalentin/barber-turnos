import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const obtenerBarberosSelectorCacheados = unstable_cache(
  async () => prisma.barbero.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  }),
  ["barberos-selector-excepciones-v1"],
  { tags: ["barberos"], revalidate: 300 },
);

export async function obtenerBarberosParaSelector() {
  return obtenerBarberosSelectorCacheados();
}
