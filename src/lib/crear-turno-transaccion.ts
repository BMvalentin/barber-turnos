import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { interpretarErrorTurno } from "@/lib/interpretar-error-turno";
import { ESTADOS_TURNO, ESTADOS_PAGO } from "@/lib/constants";
import { ejecutarConBloqueReserva } from "@/lib/turnos/ejecutar-con-bloque-reserva";
import { validarReservaEnTransaccion } from "@/lib/turnos/validar-reserva-en-transaccion";
import { obtenerTurnoDuplicado } from "@/lib/consultas/obtener-turno-duplicado";

type TurnoConDetalleCrudo = Prisma.turnoGetPayload<{
  include: typeof INCLUDE_TURNO_CON_DETALLE;
}>;

export type ResultadoCrearTurno =
  | { ok: true; turno: TurnoConDetalleCrudo; creado: boolean }
  | { ok: false; error: string };

export interface ParametrosCrearTurno {
  servicioId: string;
  userId: string;
  barberoId: string;
  idUsuarioActual: string;
  inicio: Date;
  estadoPago: (typeof ESTADOS_PAGO)[number];
  estadoFinal: (typeof ESTADOS_TURNO)[number];
}

/**
 * Re-valida disponibilidad y crea dentro de una transacción. Un bloqueo de fila
 * de MariaDB serializa por barbero y protege solapes de intervalos distintos.
 */
export async function crearTurnoEnTransaccion(
  p: ParametrosCrearTurno,
): Promise<ResultadoCrearTurno> {
  try {
    const resultadoTransaccion = await prisma.$transaction(
      async (tx) => {
        return ejecutarConBloqueReserva(tx, p.barberoId, async () => {
          const reserva = await validarReservaEnTransaccion(tx, {
            servicioId: p.servicioId,
            barberoId: p.barberoId,
            userId: p.userId,
            inicio: p.inicio,
            idUsuarioActual: p.idUsuarioActual,
          });

          const turno = await tx.turno.create({
            data: {
              servicioId: p.servicioId,
              userId: p.userId,
              barberoId: p.barberoId,
              horarioReservado: p.inicio,
              precioCongelado: reserva.precio,
              seniaCongelada: reserva.senia,
              estado: p.estadoFinal,
              estadoPago: p.estadoPago,
              claveSlot: `${p.barberoId}|${p.inicio.toISOString()}`,
            },
          });

          return { turno, reserva };
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        maxWait: 10000,
        timeout: 15000,
      },
    );
    const turno: TurnoConDetalleCrudo = {
      ...resultadoTransaccion.turno,
      user: resultadoTransaccion.reserva.user,
      barbero: resultadoTransaccion.reserva.barbero,
      servicio: resultadoTransaccion.reserva.servicio,
    };
    return { ok: true, turno, creado: true };
  } catch (error) {
    const mensaje = interpretarErrorTurno(error);
    if (mensaje === "Horario ocupado") {
      const turnoDuplicado = await obtenerTurnoDuplicado({
        userId: p.userId,
        barberoId: p.barberoId,
        horarioReservado: p.inicio,
      });
      if (turnoDuplicado) return { ok: true, turno: turnoDuplicado, creado: false };
    }
    if (mensaje) return { ok: false, error: mensaje };
    console.error(error);
    return { ok: false, error: "Error al crear turno" };
  }
}
