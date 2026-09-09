import { prisma } from "@/lib/prisma";
import { listarUrlImagenesServicio } from "@/lib/servicio-imagenes/listar-url";

export async function obtenerServiciosRecientes() {
  const registros = await prisma.servicio.findMany({
    where: { estado: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      srcImage: true,
      precio: true,
      descuento: true,
      imagenes: { orderBy: { orden: "asc" }, select: { url: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return registros.map((registro) => ({
    ...registro,
    imagenes: listarUrlImagenesServicio(registro),
  }));
}
