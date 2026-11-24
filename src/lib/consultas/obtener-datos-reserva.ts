import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { filtroBarberoActivo, filtroBarberoReservable, filtroHorarioBarberoActivo } from "@/lib/barberos/filtros-perfiles";
import { obtenerCamposPendientesPerfil } from "@/lib/barberos/perfil-profesional";

export const obtenerDatosReserva = unstable_cache(
  async ({ soloPerfilesCompletos = false }: { soloPerfilesCompletos?: boolean } = {}) => {
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
        where: {
          ...filtroBarberoReservable,
          ...(soloPerfilesCompletos && {
            horarios: { some: filtroHorarioBarberoActivo },
          }),
        },
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
    if (!soloPerfilesCompletos) return { servicios, barberos, relaciones };

    const barberosVisibles = barberos.filter((barbero) => obtenerCamposPendientesPerfil({
      ...barbero,
      tieneServicioActivo: true,
      tieneHorarioActivo: true,
    }).length === 0);
    const idsVisibles = new Set(barberosVisibles.map(({ id }) => id));
    return {
      servicios,
      barberos: barberosVisibles,
      relaciones: relaciones.filter(({ barberoId }) => idsVisibles.has(barberoId)),
    };
  },
  ["catalogo-reserva-v4"],
  { tags: ["servicios", "barberos", "dias-laborales"], revalidate: 300 },
);
