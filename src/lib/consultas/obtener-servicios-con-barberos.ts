import { prisma } from "@/lib/prisma";

export async function obtenerServiciosConBarberos() {
  return prisma.servicio.findMany({
    where: { estado: true },
    include: {
      servicios: {
        include: {
          barbero: {
            select: {
              id: true,
              nombre: true,
              srcImage: true,
              estado: true,
              horarios: {
                where: { estado: true },
                include: { dia: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
