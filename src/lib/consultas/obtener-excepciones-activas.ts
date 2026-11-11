import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ExcepcionLaboral } from "@/types/excepcion";

type ExcepcionCacheada = Omit<ExcepcionLaboral, "desde" | "hasta" | "createdAt" | "updatedAt"> & {
  desde: string;
  hasta: string;
  createdAt: string;
  updatedAt: string;
};

const obtenerExcepcionesCacheadas = unstable_cache(
  async (): Promise<ExcepcionCacheada[]> => {
    const excepciones = await prisma.excepcion_laboral.findMany({
      where: { estado: true },
      include: { barbero: { select: { id: true, nombre: true } } },
      orderBy: { desde: "desc" },
    });

    return excepciones.map((excepcion) => ({
      ...excepcion,
      desde: excepcion.desde.toISOString(),
      hasta: excepcion.hasta.toISOString(),
      createdAt: excepcion.createdAt.toISOString(),
      updatedAt: excepcion.updatedAt.toISOString(),
    }));
  },
  ["excepciones-activas-admin-v1"],
  { tags: ["excepciones-globales"], revalidate: 300 },
);

export async function obtenerExcepcionesActivas(): Promise<ExcepcionLaboral[]> {
  const excepciones = await obtenerExcepcionesCacheadas();
  return excepciones.map((excepcion) => ({
    ...excepcion,
    desde: new Date(excepcion.desde),
    hasta: new Date(excepcion.hasta),
    createdAt: new Date(excepcion.createdAt),
    updatedAt: new Date(excepcion.updatedAt),
  }));
}
