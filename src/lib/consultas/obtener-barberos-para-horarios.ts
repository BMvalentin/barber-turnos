import { prisma } from "@/lib/prisma";

import type { BarberoParaHorarios } from "@/types/horarios";

export async function obtenerBarberosParaHorarios(barberoId?: string, soloEmpleados = false): Promise<BarberoParaHorarios[]> {
  return prisma.barbero.findMany({
    where: barberoId ? { id: barberoId } : soloEmpleados ? { usuario: { role: "EMPLEADO" } } : undefined,
    select: {
      id: true,
      nombre: true,
      srcImage: true,
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
}
