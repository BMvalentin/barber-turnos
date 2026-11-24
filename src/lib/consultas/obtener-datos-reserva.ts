import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { filtroBarberoActivo, filtroBarberoReservable } from "@/lib/barberos/filtros-perfiles";

export const obtenerDatosReserva = unstable_cache(
  async () => {
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
        where: filtroBarberoReservable,
        select: { id: true, nombre: true, srcImage: true, estado: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.servicioxbarbero.findMany({
        where: { barbero: filtroBarberoActivo, servicio: { estado: true } },
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
  ["catalogo-reserva-v3"],
  { tags: ["servicios", "barberos"], revalidate: 300 },
);
