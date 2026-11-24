import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  filtrarPerfilesDelEquipo,
  filtroBarberoDelEquipo,
  seleccionarActividadProfesional,
} from "@/lib/barberos/filtros-perfiles";

const obtenerBarberosSelectorCacheados = unstable_cache(
  async () => {
    const perfiles = await prisma.barbero.findMany({
      where: { ...filtroBarberoDelEquipo, estado: true },
      select: { id: true, nombre: true, ...seleccionarActividadProfesional },
      orderBy: { nombre: "asc" },
    });

    return filtrarPerfilesDelEquipo(perfiles);
  },
  ["barberos-selector-excepciones-v2"],
  { tags: ["barberos"], revalidate: 300 },
);

export async function obtenerBarberosParaSelector() {
  return obtenerBarberosSelectorCacheados();
}
