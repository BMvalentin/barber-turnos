import { prisma } from "@/lib/prisma";

export async function obtenerBarberosActivos() {
  return prisma.barbero.findMany({
    where: { estado: true },
    orderBy: { nombre: "asc" },
  });
}
