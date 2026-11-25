import { cachearConsulta } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { listarUrlImagenesServicio } from "@/lib/servicio-imagenes/listar-url";
import type { ServicioCarrusel } from "@/types/servicio";

export const obtenerServiciosRecientes = cachearConsulta(
  async (): Promise<ServicioCarrusel[]> => {
    const registros = await prisma.servicio.findMany({
      where: { estado: true },
      select: {
        id: true,
        nombre: true,
        srcImage: true,
        precio: true,
        descuento: true,
        imagenes: { orderBy: { orden: "asc" }, select: { url: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return registros.map((registro) => ({
      ...registro,
      precio: Number(registro.precio),
      descuento: Number(registro.descuento),
      imagenes: listarUrlImagenesServicio(registro),
    }));
  },
  ["servicios-carrusel-v3"],
  { tags: ["servicios"], revalidate: 3600 },
);
