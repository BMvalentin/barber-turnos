import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Servicio } from "@/types/servicio";

type ServicioCacheado = Omit<Servicio, "createdAt"> & { createdAt: string };

const obtenerServiciosAdminCacheados = unstable_cache(
  async (): Promise<ServicioCacheado[]> => {
    const registros = await prisma.servicio.findMany({
    where: { estado: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      srcImage: true,
      estado: true,
      duracion: true,
      precio: true,
      descuento: true,
      senia: true,
      createdAt: true,
      imagenes: {
        orderBy: { orden: "asc" },
        select: { url: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

    return registros.map((registro) => ({
      ...registro,
      precio: Number(registro.precio),
      descuento: Number(registro.descuento),
      senia: Number(registro.senia),
      createdAt: registro.createdAt.toISOString(),
      imagenes: registro.imagenes.map((imagen) => imagen.url),
    }));
  },
  ["admin-servicios-listado-v1"],
  { tags: ["servicios"], revalidate: 300 },
);

/** Devuelve solo los campos que usa la tabla de administración. */
export async function obtenerServiciosConBarberos(): Promise<Servicio[]> {
  const registros = await obtenerServiciosAdminCacheados();
  return registros.map((registro) => ({
    ...registro,
    createdAt: new Date(registro.createdAt),
  }));
}
