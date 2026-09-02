import { prisma } from "@/lib/prisma";
import { interpretarErrorTurno } from "@/lib/interpretar-error-turno";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { ejecutarConBloqueReserva } from "@/lib/turnos/ejecutar-con-bloque-reserva";
import { validarReservaEnTransaccion } from "@/lib/turnos/validar-reserva-en-transaccion";
import { ESTADOS_TURNO } from "@/lib/constants";
import { Prisma, type estado_pago, type turno_estado } from "../../../generated/prisma/client";

type ParametrosActualizarTurno = {
  id: string;
  servicioId: string;
  barberoId: string;
  horario: Date;
  estado: turno_estado;
  estadoPago: estado_pago;
  idUsuarioActual: string;
};

type TurnoActualizado = Prisma.turnoGetPayload<{
  include: typeof INCLUDE_TURNO_CON_DETALLE;
}>;

type ResultadoActualizarTurno =
  | { ok: true; turno: TurnoActualizado; turnoAnterior: TurnoActualizado }
  | { ok: false; error: string };

function esEstadoActivo(estado: turno_estado): boolean {
  return estado === ESTADOS_TURNO[0] || estado === ESTADOS_TURNO[1];
}

function crearClaveSlot(barberoId: string, horario: Date): string {
  return `${barberoId}|${horario.toISOString()}`;
}

/** Reprograma con validación e intervalos serializados por agenda diaria. */
export async function actualizarTurnoEnTransaccion(
  parametros: ParametrosActualizarTurno,
): Promise<ResultadoActualizarTurno> {
  try {
    const referenciaInicial = await prisma.turno.findUnique({
      where: { id: parametros.id },
      select: { barberoId: true },
    });
    if (!referenciaInicial) return { ok: false, error: "Turno no encontrado" };

    const bloqueos = [
      { barberoId: referenciaInicial.barberoId },
      { barberoId: parametros.barberoId },
    ].sort((primero, segundo) => {
      return primero.barberoId.localeCompare(segundo.barberoId);
    });

    const resultado = await prisma.$transaction(async (tx) => {
      const actualizar = async (): Promise<{ turno: TurnoActualizado; turnoAnterior: TurnoActualizado }> => {
        const turnoAnterior = await tx.turno.findUnique({
          where: { id: parametros.id },
          include: INCLUDE_TURNO_CON_DETALLE,
        });
        if (!turnoAnterior) throw new Error("TURNO_INEXISTENTE");

        const debeValidarReserva = esEstadoActivo(parametros.estado);
        const servicio = debeValidarReserva
          ? await validarReservaEnTransaccion(tx, {
              servicioId: parametros.servicioId,
              barberoId: parametros.barberoId,
              inicio: parametros.horario,
              idUsuarioActual: parametros.idUsuarioActual,
              turnoIdAExcluir: parametros.id,
            })
          : null;

        const turno = await tx.turno.update({
          where: { id: parametros.id },
          data: {
            servicioId: parametros.servicioId,
            barberoId: parametros.barberoId,
            horarioReservado: parametros.horario,
            estado: parametros.estado,
            estadoPago: parametros.estadoPago,
            ...(servicio
              ? { precioCongelado: servicio.precio, seniaCongelada: servicio.senia }
              : {}),
            claveSlot: esEstadoActivo(parametros.estado)
              ? crearClaveSlot(parametros.barberoId, parametros.horario)
              : null,
          },
          include: INCLUDE_TURNO_CON_DETALLE,
        });

        return { turno, turnoAnterior };
      };

      const ejecutarSegundoBloque = async () => {
        if (bloqueos.length === 1 || (
          bloqueos[0].barberoId === bloqueos[1].barberoId
        )) {
          return actualizar();
        }
        return ejecutarConBloqueReserva(
          tx,
          bloqueos[1].barberoId,
          actualizar,
        );
      };

      return ejecutarConBloqueReserva(
        tx,
        bloqueos[0].barberoId,
        ejecutarSegundoBloque,
      );
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });

    return { ok: true, ...resultado };
  } catch (error) {
    const mensaje = interpretarErrorTurno(error);
    if (mensaje) return { ok: false, error: mensaje };
    if (error instanceof Error && error.message === "TURNO_INEXISTENTE") {
      return { ok: false, error: "Turno no encontrado" };
    }
    console.error(error);
    return { ok: false, error: "Error al actualizar el turno" };
  }
}
