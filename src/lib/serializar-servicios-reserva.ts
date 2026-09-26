import type { servicio } from "../../generated/prisma/client";

export function serializarServiciosReserva(servicios: servicio[]) {
  return servicios.map((servicio) => ({
    ...servicio,
    precio: Number(servicio.precio),
    descuento: Number(servicio.descuento),
    senia: Number(servicio.senia),
  }));
}
