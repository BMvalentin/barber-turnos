"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Prisma, turno_estado } from "../../../generated/prisma/client";

export async function getTurnos(page: number = 1, estadoFiltro?: string, fechaFiltro?: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autorizado" };

    const isAdmin = session.user.role === "ADMIN";
    const pageSize = 6;
    const skip = (page - 1) * pageSize;

    const where: Prisma.turnoWhereInput = {};

    if (!isAdmin) where.userId = session.user.id;
    if (estadoFiltro && estadoFiltro !== "TODOS") where.estado = estadoFiltro as turno_estado;

    // Filtrado por fecha (convierte el string 'YYYY-MM-DD' a rango)
    if (fechaFiltro) {
      const start = new Date(fechaFiltro);
      const end = new Date(fechaFiltro);
      end.setDate(end.getDate() + 1);

      where.horarioReservado = {
        gte: start,
        lt: end,
      };
    }

    const [turnos, totalCount] = await Promise.all([
      prisma.turno.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true, telefono: true } },
          servicio: { select: { id: true, nombre: true, duracion: true } },
          barbero: { select: { id: true, nombre: true } },
        },
        orderBy: { horarioReservado: "desc" },
      }),
      prisma.turno.count({ where })
    ]);

    const data = turnos.map((t) => ({
      ...t,
      precioCongelado: Number(t.precioCongelado),
      seniaCongelada: Number(t.seniaCongelada),
    }));

    return {
      success: true,
      data,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page
    };

  } catch (error) {
    return { success: false, error: "Error al obtener turnos" };
  }
}
