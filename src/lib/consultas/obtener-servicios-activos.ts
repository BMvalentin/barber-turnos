import { prisma } from "@/lib/prisma";
import { listarUrlImagenesServicio } from "@/lib/servicio-imagenes/listar-url";

export async function obtenerServiciosActivos() {
  const registros = await prisma.servicio.findMany({
    where: { estado: true },
    include: {
      imagenes: { orderBy: { orden: "asc" }, select: { url: true } },
    },
    orderBy: { nombre: "asc" },
  });

  return registros.map((registro) => ({
    ...registro,
    imagenes: listarUrlImagenesServicio(registro),
  }));
}
