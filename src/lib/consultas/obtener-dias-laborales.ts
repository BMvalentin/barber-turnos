import { prisma } from "@/lib/prisma";

export async function obtenerDiasLaborales() {
  return prisma.dia_laboral.findMany({
    include: { margenes: { orderBy: { desde: "asc" } } },
    orderBy: { dia: "asc" },
  });
}
