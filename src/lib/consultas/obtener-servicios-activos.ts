import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { listarUrlImagenesServicio } from "@/lib/servicio-imagenes/listar-url";

const obtenerServiciosActivosCacheada = unstable_cache(
  async () => {
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
  },
  ["servicios-activos-v1"],
  { tags: ["servicios"], revalidate: 300 },
);

export async function obtenerServiciosActivos() {
  return obtenerServiciosActivosCacheada();
}
