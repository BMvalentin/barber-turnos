import { prisma } from "@/lib/prisma";

export async function obtenerDiasLaboralesActivos() {
  return prisma.dia_laboral.findMany({
    where: { estado: true },
    include: {
      margenes: { where: { estado: true }, orderBy: { desde: "asc" } },
    },
    orderBy: { dia: "asc" },
  });
}
