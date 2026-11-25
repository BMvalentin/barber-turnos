import { cachearConsulta } from "@/lib/cache";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { filtroBarberoReservable, filtroHorarioBarberoActivo } from "@/lib/barberos/filtros-perfiles";
import { obtenerCamposPendientesPerfil } from "@/lib/barberos/perfil-profesional";

const obtenerPendientesCacheados = cachearConsulta(
  async (barberoId: string, usuarioId: string) => {
    const perfil = await prisma.barbero.findUnique({
      where: { id: barberoId, usuarioId, estado: true },
      select: {
        nombre: true,
        srcImage: true,
        _count: {
          select: {
            servicios: { where: filtroBarberoReservable.servicios.some },
            horarios: { where: filtroHorarioBarberoActivo },
          },
        },
      },
    });
    if (!perfil) return [];

    return obtenerCamposPendientesPerfil({
      nombre: perfil.nombre,
      srcImage: perfil.srcImage,
      tieneServicioActivo: perfil._count.servicios > 0,
      tieneHorarioActivo: perfil._count.horarios > 0,
    });
  },
  ["pendientes-perfil-barbero-v1"],
  { tags: ["barberos", "servicios", "dias-laborales"], revalidate: 180 },
);

export const obtenerPendientesPerfilBarbero = cache(obtenerPendientesCacheados);
