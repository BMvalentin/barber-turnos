import { cachearConsulta } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { filtroBarberoParaAgenda } from "@/lib/barberos/filtros-perfiles";

const obtenerBarberosFiltroTurnosCacheados = cachearConsulta(
  async () => prisma.barbero.findMany({
    where: filtroBarberoParaAgenda,
    select: { id: true, nombre: true, srcImage: true, estado: true },
    orderBy: { nombre: "asc" },
  }),
  ["barberos-filtro-turnos-v3"],
  { tags: ["barberos", "servicios"], revalidate: 60 },
);

export async function obtenerBarberosFiltroTurnos() {
  return obtenerBarberosFiltroTurnosCacheados();
}
