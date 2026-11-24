import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const obtenerServiciosActivos = unstable_cache(
  async () => prisma.servicio.findMany({
    where: { estado: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  }),
  ["servicios-activos-selector"],
  { tags: ["servicios"], revalidate: 3600 },
);
