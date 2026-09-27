import { prisma } from "@/lib/prisma";
import { listarUrlImagenesServicio } from "@/lib/servicio-imagenes/listar-url";

export async function obtenerServiciosConBarberos() {
  const registros = await prisma.servicio.findMany({
    where: { estado: true },
    include: {
      imagenes: { orderBy: { orden: "asc" }, select: { url: true } },
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

  return registros.map((registro) => ({
    ...registro,
    imagenes: listarUrlImagenesServicio(registro),
  }));
}
