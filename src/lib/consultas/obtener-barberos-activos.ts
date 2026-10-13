import { prisma } from "@/lib/prisma";
import { SELECCION_BARBERO_PUBLICA } from "@/lib/constants";

export async function obtenerBarberosActivos() {
  return prisma.barbero.findMany({
    // Un perfil sin cuenta vinculada no tiene quién atienda sus turnos.
    where: { estado: true, usuarioId: { not: null } },
    select: SELECCION_BARBERO_PUBLICA,
    orderBy: { nombre: "asc" },
  });
}
