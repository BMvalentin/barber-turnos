import { cachearConsulta } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { filtroBarberoParaAgenda, filtroBarberoReservable } from "@/lib/barberos/filtros-perfiles";

const seleccionarBarberoFiltro = { id: true, nombre: true, srcImage: true, estado: true } as const;

const obtenerBarberosFiltroTurnosCacheados = cachearConsulta(
  async () => prisma.barbero.findMany({
    where: filtroBarberoParaAgenda,
    select: seleccionarBarberoFiltro,
    orderBy: { nombre: "asc" },
  }),
  ["barberos-filtro-turnos-v3"],
  { tags: ["barberos", "servicios"], revalidate: 60 },
);

export const obtenerBarberoPropioParaAgenda = cachearConsulta(
  (id: string) => prisma.barbero.findFirst({
    where: { id, ...filtroBarberoReservable },
    select: seleccionarBarberoFiltro,
  }),
  ["barbero-propio-filtro-turnos"],
  { tags: ["barberos", "servicios"], revalidate: 60 },
);

export async function obtenerBarberosFiltroTurnos() {
  return obtenerBarberosFiltroTurnosCacheados();
}
