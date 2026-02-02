"use server";

import { prisma } from "@/lib/prisma";;

/*
  devuelve:
-




 */
/* =========================
    READ TURNOS
========================= */
export async function obtenerTurnos(params: { 
  search?: string; 
  orderBy?: string; 
  orderDir?: "asc" | "desc" 
}) {
  try {
    const { search, orderBy, orderDir = "asc" } = params;

    const where = search
      ? {
          OR: [
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
            { patente: { contains: search } },
          ],
        }
      : undefined;

    // Mapeo de ordenamiento dinámico
    let orden: any = { horarioReservado: orderDir }; // Default
    if (orderBy === "name" || orderBy === "email" || orderBy === "telefono") {
      orden = { user: { [orderBy]: orderDir } };
    } else if (orderBy === "patente" || orderBy === "horarioReservado") {
      orden = { [orderBy]: orderDir };
    }

    const turnosRaw = await prisma.turno.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, telefono: true, image: true } },
        vehiculo_servicio: {
          include: { servicio: true, vehiculo: true },
        },
      },
      orderBy: orden,
    });

    // TRANSFORMACIÓN: Convertimos Decimal a Number para que Next.js no se queje
    const turnos = turnosRaw.map(turno => ({
      ...turno,
      // Convertimos los Decimal de la tabla 'turno'
      precioCongelado: turno.precioCongelado.toNumber(),
      seniaCongelada: turno.seniaCongelada.toNumber(),
      vehiculo_servicio: {
        ...turno.vehiculo_servicio,
        // Convertimos los Decimal de la tabla 'vehiculo_servicio'
        precio: turno.vehiculo_servicio.precio.toNumber(),
        descuento: turno.vehiculo_servicio.descuento.toNumber(),
        senia: turno.vehiculo_servicio.senia.toNumber(),
      }
    }));

    return turnos;
  } catch (error) {
    console.error("❌ Error en obtenerTurnos:", error);
    throw new Error("No se pudieron obtener los turnos.");
  }
}