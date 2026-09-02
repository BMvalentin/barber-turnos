import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { interpretarErrorTurno } from "@/lib/interpretar-error-turno";
import { ESTADOS_TURNO, ESTADOS_PAGO } from "@/lib/constants";
import { ejecutarConBloqueReserva } from "@/lib/turnos/ejecutar-con-bloque-reserva";
import { validarReservaEnTransaccion } from "@/lib/turnos/validar-reserva-en-transaccion";

type TurnoConDetalleCrudo = Prisma.turnoGetPayload<{
  include: typeof INCLUDE_TURNO_CON_DETALLE;
}>;

export type ResultadoCrearTurno =
  | { ok: true; turno: TurnoConDetalleCrudo }
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
    const turno = await prisma.$transaction(
      async (tx) => {
        return ejecutarConBloqueReserva(tx, p.barberoId, async () => {
          const servicio = await validarReservaEnTransaccion(tx, {
            servicioId: p.servicioId,
            barberoId: p.barberoId,
            inicio: p.inicio,
            idUsuarioActual: p.idUsuarioActual,
          });

          return tx.turno.create({
            data: {
              servicioId: p.servicioId,
              userId: p.userId,
              barberoId: p.barberoId,
              horarioReservado: p.inicio,
              precioCongelado: servicio.precio,
              seniaCongelada: servicio.senia,
              estado: p.estadoFinal,
              estadoPago: p.estadoPago,
              claveSlot: `${p.barberoId}|${p.inicio.toISOString()}`,
            },
            include: INCLUDE_TURNO_CON_DETALLE,
          });
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
    return { ok: true, turno };
  } catch (error) {
    const mensaje = interpretarErrorTurno(error);
    if (mensaje) return { ok: false, error: mensaje };
    console.error(error);
    return { ok: false, error: "Error al crear turno" };
  }
}
