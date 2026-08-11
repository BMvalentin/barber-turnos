import { prisma } from "@/lib/prisma";
import { obtenerServiciosActivos } from "@/lib/consultas/obtener-servicios-activos";
import { obtenerBarberosActivos } from "@/lib/consultas/obtener-barberos-activos";

export async function obtenerDatosReserva(incluirUsuarios: boolean) {
  const [servicios, barberos, usuarios, relaciones, config] = await Promise.all([
    obtenerServiciosActivos(),
    obtenerBarberosActivos(),
    incluirUsuarios
      ? prisma.user.findMany({
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : [],
    prisma.servicioxbarbero.findMany({
      select: { barberoId: true, servicioId: true },
    }),
    prisma.pageConfig.findUnique({ where: { id: 1 } }),
  ]);

  return { servicios, barberos, usuarios, relaciones, config };
}
