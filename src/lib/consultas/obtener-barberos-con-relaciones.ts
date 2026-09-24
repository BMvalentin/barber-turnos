import { prisma } from "@/lib/prisma";

export async function obtenerBarberosConRelaciones(barberoId?: string, soloEmpleados = false) {
  return prisma.barbero.findMany({
    where: barberoId ? { id: barberoId } : soloEmpleados ? { usuario: { role: "EMPLEADO" } } : undefined,
    include: {
      usuario: { select: { id: true, email: true } },
      servicios: { include: { servicio: true } },
      horarios: { include: { dia: true, margenLaboral: true } },
    },
    orderBy: { nombre: "asc" },
  });
}
