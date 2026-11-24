import { prisma } from "@/lib/prisma";

export async function obtenerServiciosPopulares(barberoId?: string) {
  const reservas = await prisma.turno.groupBy({
    by: ["servicioId"],
    where: { barberoId, estado: { not: "CANCELADO" }, servicio: { estado: true } },
    _count: { servicioId: true },
    orderBy: [{ _count: { servicioId: "desc" } }, { servicioId: "asc" }],
    take: 3,
  });
  if (reservas.length === 0) return [];

  const servicios = await prisma.servicio.findMany({
    where: { id: { in: reservas.map(({ servicioId }) => servicioId) } },
    select: { id: true, nombre: true },
  });
  const nombres = new Map(servicios.map(({ id, nombre }) => [id, nombre]));

  return reservas.flatMap(({ servicioId, _count }) => {
    const nombre = nombres.get(servicioId);
    return nombre ? [{ id: servicioId, nombre, reservas: _count.servicioId }] : [];
  });
}
