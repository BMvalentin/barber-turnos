import { addMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { Prisma } from "../../../generated/prisma/client";
import { ZONA_HORARIA } from "@/lib/constants";
import { obtenerContextoDeReserva } from "@/lib/contexto-reserva";
import { existeLockAjeno } from "@/lib/locks";
import { entraEnMargen } from "@/lib/margenes";

type ParametrosValidacionReserva = {
  servicioId: string;
  barberoId: string;
  inicio: Date;
  idUsuarioActual: string;
  turnoIdAExcluir?: string;
};

type ServicioReservable = {
  duracion: number;
  precio: Prisma.Decimal;
  senia: Prisma.Decimal;
};

/** Valida en la transacción que la reserva sea posible con los datos actuales. */
export async function validarReservaEnTransaccion(
  tx: Prisma.TransactionClient,
  parametros: ParametrosValidacionReserva,
): Promise<ServicioReservable> {
  const servicio = await tx.servicio.findUnique({
    where: { id: parametros.servicioId },
    select: { estado: true, duracion: true, precio: true, senia: true },
  });
  if (!servicio || !servicio.estado) throw new Error("SERVICIO_NO_DISPONIBLE");

  const barbero = await tx.barbero.findUnique({
    where: { id: parametros.barberoId },
    select: { estado: true },
  });
  if (!barbero || !barbero.estado) throw new Error("BARBERO_NO_DISPONIBLE");

  const relacion = await tx.servicioxbarbero.findUnique({
    where: {
      barbero_servicio_unique: {
        barberoId: parametros.barberoId,
        servicioId: parametros.servicioId,
      },
    },
    select: { id: true },
  });
  if (!relacion) throw new Error("SERVICIO_NO_ASIGNADO");

  const inicioZonado = toZonedTime(parametros.inicio, ZONA_HORARIA);
  const fin = addMinutes(parametros.inicio, servicio.duracion);
  const { diaLaboral, excepciones, turnosDelDia } = await obtenerContextoDeReserva(
    parametros.barberoId,
    inicioZonado.getDay(),
    parametros.inicio,
    fin,
    tx,
    parametros.turnoIdAExcluir,
  );

  if (excepciones.length > 0) throw new Error(`EXCEPCION:${excepciones[0].motivo}`);
  if (!diaLaboral) throw new Error("CERRADO");

  const minutosInicio = inicioZonado.getHours() * 60 + inicioZonado.getMinutes();
  if (!entraEnMargen(diaLaboral.margenes, minutosInicio, minutosInicio + servicio.duracion)) {
    throw new Error("FUERA_DE_RANGO");
  }

  const hayChoque = turnosDelDia.some((turno) => {
    const finTurno = addMinutes(turno.horarioReservado, turno.servicio.duracion);
    return parametros.inicio < finTurno && fin > turno.horarioReservado;
  });
  if (hayChoque) throw new Error("TURNO_OCUPADO");

  if (await existeLockAjeno(parametros.barberoId, parametros.inicio, parametros.idUsuarioActual, tx)) {
    throw new Error("TURNO_LOCKED");
  }

  return servicio;
}
