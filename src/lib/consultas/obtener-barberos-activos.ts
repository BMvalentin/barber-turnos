import { prisma } from "@/lib/prisma";
import { SELECCION_BARBERO_PUBLICA } from "@/lib/constants";

export async function obtenerBarberosActivos() {
  return prisma.barbero.findMany({
    where: { estado: true },
    select: SELECCION_BARBERO_PUBLICA,
    orderBy: { nombre: "asc" },
  });
}
