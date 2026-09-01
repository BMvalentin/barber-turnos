import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { addMinutes } from "date-fns";
import { existeLockAjeno } from "@/lib/locks";
import { entraEnMargen } from "@/lib/margenes";
import { obtenerContextoDeReserva } from "@/lib/contexto-reserva";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { interpretarErrorTurno } from "@/lib/interpretar-error-turno";
import { ESTADOS_TURNO, ESTADOS_PAGO } from "@/lib/constants";

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
  fin: Date;
  diaSemana: number;
  minInicio: number;
  duracion: number;
  precioCongelado: number;
  seniaCongelada: number;
  estadoPago: (typeof ESTADOS_PAGO)[number];
  estadoFinal: (typeof ESTADOS_TURNO)[number];
}

/**
 * Re-valida la disponibilidad y crea el turno dentro de UNA transacción. TiDB
 * no soporta `isolationLevel: Serializable` (rechaza `SET TRANSACTION ISOLATION
 * LEVEL SERIALIZABLE`), por lo que se usa `RepeatableRead` (el default del
 * motor). La garantía dura contra la doble reserva la aporta el índice único
 * sobre `claveSlot` (columna anulable: los turnos activos ocupan el slot y los
 * CANCELADO/COMPLETADO lo liberan), respaldado a nivel de base de datos.
 */
export async function crearTurnoEnTransaccion(
  p: ParametrosCrearTurno,
): Promise<ResultadoCrearTurno> {
  try {
    const turno = await prisma.$transaction(
      async (tx) => {
        const { diaLaboral, excepciones, turnosDelDia } = await obtenerContextoDeReserva(
          p.barberoId,
          p.diaSemana,
          p.inicio,
          p.fin,
          tx,
        );
        if (excepciones.length > 0) throw new Error("EXCEPCION:" + excepciones[0].motivo);
        if (!diaLaboral) throw new Error("CERRADO");
        const minFin = p.minInicio + p.duracion;
        if (!entraEnMargen(diaLaboral.margenes, p.minInicio, minFin)) {
          throw new Error("FUERA_DE_RANGO");
        }
        const hayChoque = turnosDelDia.some((t) => {
          const tFin = addMinutes(new Date(t.horarioReservado), t.servicio.duracion);
          return p.inicio < tFin && p.fin > t.horarioReservado;
        });
        if (hayChoque) throw new Error("TURNO_OCUPADO");
        if (await existeLockAjeno(p.barberoId, p.inicio, p.idUsuarioActual, tx)) {
          throw new Error("TURNO_LOCKED");
        }
        return tx.turno.create({
          data: {
            servicioId: p.servicioId,
            userId: p.userId,
            barberoId: p.barberoId,
            horarioReservado: p.inicio,
            precioCongelado: p.precioCongelado,
            seniaCongelada: p.seniaCongelada,
            estado: p.estadoFinal,
            estadoPago: p.estadoPago,
            claveSlot: `${p.barberoId}|${p.inicio.toISOString()}`,
          },
          include: INCLUDE_TURNO_CON_DETALLE,
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
