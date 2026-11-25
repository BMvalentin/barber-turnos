import { cachearConsulta } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export const obtenerServiciosActivos = cachearConsulta(
  async () => prisma.servicio.findMany({
    where: { estado: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  }),
  ["servicios-activos-selector"],
  { tags: ["servicios"], revalidate: 3600 },
);
