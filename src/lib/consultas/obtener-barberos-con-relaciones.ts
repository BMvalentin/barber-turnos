import { prisma } from "@/lib/prisma";

export async function obtenerBarberosConRelaciones(barberoId?: string, soloEmpleados = false) {
  const barberos = await prisma.barbero.findMany({
    where: barberoId ? { id: barberoId } : soloEmpleados ? { usuario: { role: "EMPLEADO" } } : undefined,
    include: {
      usuario: { select: { id: true, email: true } },
      servicios: { include: { servicio: true } },
      horarios: { include: { dia: true, margenLaboral: true } },
    },
    orderBy: { nombre: "asc" },
  });

  // Decimal no es serializable hacia Client Components: se expone como número.
  return barberos.map((barbero) => ({
    ...barbero,
    porcentajeGanancia: Number(barbero.porcentajeGanancia),
  }));
}
