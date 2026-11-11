import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const obtenerBarberosFiltroTurnosCacheados = unstable_cache(
  async () => prisma.barbero.findMany({
    where: { OR: [{ usuarioId: { not: null } }, { turnos: { some: {} } }] },
    select: { id: true, nombre: true, srcImage: true, estado: true },
    orderBy: [{ estado: "desc" }, { nombre: "asc" }],
  }),
  ["barberos-filtro-turnos-v1"],
  { tags: ["barberos", "turnos-global"], revalidate: 60 },
);

export async function obtenerBarberosFiltroTurnos() {
  return obtenerBarberosFiltroTurnosCacheados();
}
