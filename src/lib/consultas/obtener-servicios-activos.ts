import { prisma } from "@/lib/prisma";

export async function obtenerServiciosActivos() {
  return prisma.servicio.findMany({
    where: { estado: true },
    orderBy: { nombre: "asc" },
  });
}
