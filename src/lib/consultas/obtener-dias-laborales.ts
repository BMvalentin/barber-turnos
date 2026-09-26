import { prisma } from "@/lib/prisma";

export async function obtenerDiasLaborales() {
  return prisma.dia_laboral.findMany({
    select: { id: true, dia: true },
    orderBy: { dia: "asc" },
  });
}
