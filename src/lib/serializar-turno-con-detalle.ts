import type { Prisma } from "../../generated/prisma/client";
import type { TurnoConDetalle } from "@/types/turno";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";

type TurnoConDetallePayload = Prisma.turnoGetPayload<{
  include: typeof INCLUDE_TURNO_CON_DETALLE;
}>;

/* Serializa un turno con detalle a DTO plano para viajar de Server a Client:
   los Decimal de Prisma no se serializan como JSON. */
export function serializarTurnoConDetalle(turno: TurnoConDetallePayload): TurnoConDetalle {
  return {
    ...turno,
    precioCongelado: Number(turno.precioCongelado),
    seniaCongelada: Number(turno.seniaCongelada),
    servicio: {
      ...turno.servicio,
      precio: Number(turno.servicio.precio),
      senia: Number(turno.servicio.senia),
      descuento: Number(turno.servicio.descuento),
    },
  };
}
