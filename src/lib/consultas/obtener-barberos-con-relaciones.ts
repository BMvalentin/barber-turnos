import { prisma } from "@/lib/prisma";

export async function obtenerBarberosConRelaciones() {
  return prisma.barbero.findMany({
    include: {
      servicios: { include: { servicio: true } },
      horarios: { include: { dia: true, margenLaboral: true } },
    },
    orderBy: { nombre: "asc" },
  });
}
