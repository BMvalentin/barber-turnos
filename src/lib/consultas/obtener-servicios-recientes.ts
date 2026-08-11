import { prisma } from "@/lib/prisma";

export async function obtenerServiciosRecientes() {
  return prisma.servicio.findMany({
    where: { estado: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      srcImage: true,
      precio: true,
      descuento: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
