import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { obtenerServiciosActivos } from "@/lib/consultas/obtener-servicios-activos";
import { obtenerBarberosActivos } from "@/lib/consultas/obtener-barberos-activos";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";

const obtenerCatalogoReserva = unstable_cache(
  async () => {
    const [servicios, barberos, relaciones] = await Promise.all([
      obtenerServiciosActivos(),
      obtenerBarberosActivos(),
      prisma.servicioxbarbero.findMany({
        select: { barberoId: true, servicioId: true },
      }),
    ]);

    return { servicios, barberos, relaciones };
  },
  ["catalogo-reserva"],
  { tags: ["servicios", "barberos"], revalidate: 300 },
);

export async function obtenerDatosReserva(incluirUsuarios: boolean) {
  const [catalogo, usuarios, config] = await Promise.all([
    obtenerCatalogoReserva(),
    incluirUsuarios
      ? prisma.user.findMany({
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : [],
    obtenerConfigCacheada(),
  ]);

  return { ...catalogo, usuarios, config };
}
