import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { filtroBarberoParaAgenda } from "@/lib/barberos/filtros-perfiles";

const obtenerBarberosFiltroTurnosCacheados = unstable_cache(
  async () => prisma.barbero.findMany({
    where: filtroBarberoParaAgenda,
    select: { id: true, nombre: true, srcImage: true, estado: true },
    orderBy: [{ estado: "desc" }, { nombre: "asc" }],
  }),
  ["barberos-filtro-turnos-v2"],
  { tags: ["barberos", "turnos-global"], revalidate: 60 },
);

export async function obtenerBarberosFiltroTurnos() {
  return obtenerBarberosFiltroTurnosCacheados();
}
