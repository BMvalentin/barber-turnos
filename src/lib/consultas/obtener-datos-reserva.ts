import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const obtenerDatosReserva = unstable_cache(
  async () => {
    const barberoActivo = { estado: true, usuarioId: { not: null } };
    const [registrosServicios, barberos, relaciones] = await Promise.all([
      prisma.servicio.findMany({
        where: { estado: true },
        select: {
          id: true, nombre: true, descripcion: true, precio: true,
          duracion: true, descuento: true, senia: true,
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.barbero.findMany({
        where: barberoActivo,
        select: { id: true, nombre: true, srcImage: true, estado: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.servicioxbarbero.findMany({
        where: { barbero: barberoActivo, servicio: { estado: true } },
        select: { barberoId: true, servicioId: true },
      }),
    ]);

    const servicios = registrosServicios.map((servicio) => ({
      ...servicio,
      precio: Number(servicio.precio),
      descuento: Number(servicio.descuento),
      senia: Number(servicio.senia),
    }));
    return { servicios, barberos, relaciones };
  },
  ["catalogo-reserva-v2"],
  { tags: ["servicios", "barberos"], revalidate: 300 },
);
