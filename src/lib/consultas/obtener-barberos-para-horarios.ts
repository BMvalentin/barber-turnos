import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  filtrarPerfilesDelEquipo,
  filtroBarberoDelEquipo,
  seleccionarActividadProfesional,
} from "@/lib/barberos/filtros-perfiles";

import type { BarberoParaHorarios } from "@/types/horarios";

const obtenerBarberosParaHorariosCacheados = unstable_cache(
  async (barberoId: string | null): Promise<BarberoParaHorarios[]> => {
    const perfiles = await prisma.barbero.findMany({
      where: barberoId ? { id: barberoId } : filtroBarberoDelEquipo,
      select: {
        id: true,
        nombre: true,
        srcImage: true,
        ...seleccionarActividadProfesional,
        horarios: {
          select: {
            id: true,
            estado: true,
            diaId: true,
            dia: { select: { id: true, dia: true } },
            margenLaboral: { select: { desde: true, hasta: true } },
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    return filtrarPerfilesDelEquipo(perfiles, barberoId);
  },
  ["barberos-para-horarios-v2"],
  { tags: ["barberos", "dias-laborales"], revalidate: 180 },
);

export async function obtenerBarberosParaHorarios(barberoId?: string): Promise<BarberoParaHorarios[]> {
  return obtenerBarberosParaHorariosCacheados(barberoId ?? null);
}
