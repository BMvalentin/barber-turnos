"use server";

import { prisma } from "@/lib/prisma";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";

export async function getUserTurnos(userId: string) {
  try {
    // Solo el propio usuario (o un admin) puede ver sus turnos
    const sesionAutorizada = await requerirPropietarioOAdmin(userId);
    if (!sesionAutorizada) return [];

    const turnosRaw = await prisma.turno.findMany({
      where: { userId },
      orderBy: { horarioReservado: "desc" },
      include: INCLUDE_TURNO_CON_DETALLE,
    });

    return turnosRaw.map((t) => ({
      ...t,
      precioCongelado: Number(t.precioCongelado),
      seniaCongelada: Number(t.seniaCongelada),
      servicio: t.servicio ? {
        ...t.servicio,
        precio: Number(t.servicio.precio),
        senia: Number(t.servicio.senia),
        descuento: Number(t.servicio.descuento),
      } : t.servicio,
    }));
  } catch (error) {
    console.error("Error fetching user turnos:", error);
    return [];
  }
}
